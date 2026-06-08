'use client'

import { useEffect, useState } from 'react'
import {
  events as eventsApi,
  profile as profileApi,
  registrations as registrationsApi,
  modalities as modalitiesApi,
  categories as categoriesApi,
  ApiError,
} from '../api'
import {
  calculatePrice,
  getSuggestedCategory,
  getParticipantAge,
} from '../domain/registrations'
import { useAuth } from '../auth-context'
import type {
  EventResponse,
  ShirtSize,
  BloodType,
  EventModalityResponse,
  EventCategoryResponse,
  RegisterParticipantRequest,
} from '../types'

export type RegistrationStep = 'profile' | 'modality' | 'category' | 'confirm' | 'success'

export interface StepDescriptor {
  key: RegistrationStep
  label: string
  number: number
}

export interface ParticipantFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  shirtSize: ShirtSize | ''
  bloodType: BloodType | ''
  emergencyContactName: string
  emergencyContactPhone: string
  medicalConditions: string
}

export interface UseRegistrationFlowResult {
  event: EventResponse | null
  eventModalities: EventModalityResponse[]
  eventCategories: EventCategoryResponse[]
  relevantCategories: EventCategoryResponse[]
  selectedModality: EventModalityResponse | null
  selectedCategory: EventCategoryResponse | null
  ticketCode: string

  allSteps: StepDescriptor[]
  currentStepIndex: number
  suggestedCategory: EventCategoryResponse | null
  participantAge: number | null
  effectivePrice: number
  participantFullName: string
  hasModalities: boolean
  hasCategories: boolean

  step: RegistrationStep
  setStep: (s: RegistrationStep) => void
  handleSelectModality: (m: EventModalityResponse) => void
  setSelectedCategory: (c: EventCategoryResponse | null) => void

  wantsShirt: boolean | null
  setWantsShirt: (v: boolean | null) => void

  waiverRead: boolean
  waiverAccepted: boolean
  setWaiverAccepted: (v: boolean) => void
  waiverAcceptedAtTime: Date | null
  showWaiverModal: boolean
  setShowWaiverModal: (v: boolean) => void
  handleAcceptWaiver: () => void

  participantFormData: ParticipantFormData
  setParticipantFormData: (v: ParticipantFormData) => void
  profileError: string | null
  handleNextFromProfile: () => void

  isRegistering: boolean
  registerError: string | null
  handleRegister: () => Promise<void>

  isPageLoading: boolean
}

const DEFAULT_PARTICIPANT_FORM: ParticipantFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  shirtSize: '',
  bloodType: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalConditions: '',
}

export function useRegistrationFlow(eventId: string): UseRegistrationFlowResult {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [step, setStep] = useState<RegistrationStep>('profile')
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [eventModalities, setEventModalities] = useState<EventModalityResponse[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategoryResponse[]>([])
  const [selectedModality, setSelectedModality] = useState<EventModalityResponse | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryResponse | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [ticketCode, setTicketCode] = useState('')

  const [participantFormData, setParticipantFormData] = useState<ParticipantFormData>(DEFAULT_PARTICIPANT_FORM)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [wantsShirt, setWantsShirt] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const [waiverRead, setWaiverRead] = useState(false)
  const [waiverAccepted, setWaiverAccepted] = useState(false)
  const [showWaiverModal, setShowWaiverModal] = useState(false)
  const [waiverAcceptedAtTime, setWaiverAcceptedAtTime] = useState<Date | null>(null)

  useEffect(() => {
    if (isAuthLoading) return

    const profilePromise = isAuthenticated
      ? profileApi.getParticipant().catch((err: unknown) => {
          if (err instanceof ApiError && (err.status === 404 || err.status === 401)) return null
          return null
        })
      : Promise.resolve(null)

    Promise.all([
      eventsApi.get(eventId),
      modalitiesApi.list(eventId).catch(() => [] as EventModalityResponse[]),
      categoriesApi.list(eventId).catch(() => [] as EventCategoryResponse[]),
      profilePromise,
    ])
      .then(([eventData, modalitiesData, categoriesData, profileData]) => {
        setEvent(eventData)
        setEventModalities(modalitiesData)
        setEventCategories(categoriesData)

        // Pre-fill participant form from auth user + profile
        const prefilled: ParticipantFormData = {
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          email: user?.email ?? '',
          phone: profileData?.phone ?? '',
          shirtSize: (profileData?.shirtSize as ShirtSize) ?? '',
          bloodType: (profileData?.bloodType as BloodType) ?? '',
          emergencyContactName: profileData?.emergencyContactName ?? '',
          emergencyContactPhone: profileData?.emergencyContactPhone ?? '',
          medicalConditions: profileData?.medicalConditions ?? '',
        }
        setParticipantFormData(prefilled)
      })
      .catch((err: unknown) => {
        setProfileError(err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar los datos.')
      })
      .finally(() => setIsPageLoading(false))
  }, [isAuthLoading, isAuthenticated, eventId, user?.firstName, user?.lastName, user?.email])

  const handleNextFromProfile = () => {
    if (!participantFormData.firstName.trim() || !participantFormData.lastName.trim() || !participantFormData.email.trim()) {
      setProfileError('Nombre, apellido y email son requeridos.')
      return
    }
    setProfileError(null)
    if (eventModalities.length > 0) {
      setStep('modality')
    } else if (eventCategories.length > 0) {
      setStep('category')
    } else {
      setStep('confirm')
    }
  }

  const handleSelectModality = (modality: EventModalityResponse) => {
    setSelectedModality(modality)
    setSelectedCategory(null)
    setWantsShirt(modality.priceWithoutShirt != null ? null : true)
    const relevant = eventCategories.filter(
      (c) => c.modalityId == null || c.modalityId === modality.id
    )
    setStep(relevant.length > 0 ? 'category' : 'confirm')
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setRegisterError(null)
    try {
      const payload: RegisterParticipantRequest = {
        participantEmail: participantFormData.email,
        participantFirstName: participantFormData.firstName,
        participantLastName: participantFormData.lastName,
        participantPhone: participantFormData.phone || undefined,
        modalityId: selectedModality?.id,
        categoryId: selectedCategory?.id,
        waiverAccepted: true,
        wantsShirt: wantsShirt ?? true,
        shirtSize: participantFormData.shirtSize || undefined,
        bloodType: participantFormData.bloodType || undefined,
        emergencyContactName: participantFormData.emergencyContactName || undefined,
        emergencyContactPhone: participantFormData.emergencyContactPhone || undefined,
        medicalConditions: participantFormData.medicalConditions || undefined,
      }
      const reg = await registrationsApi.register(eventId, payload, isAuthenticated)
      setTicketCode(reg.ticketCode)
      setStep('success')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setRegisterError('Ya estás inscrito en este evento con este email.')
        } else if (err.status === 422) {
          setRegisterError(
            err.detail || 'No es posible completar la inscripción. Verifica que el evento tenga cupo y las inscripciones estén abiertas.'
          )
        } else {
          setRegisterError(err.detail || err.message)
        }
      } else {
        setRegisterError('Error al procesar la inscripción. Intenta de nuevo.')
      }
    } finally {
      setIsRegistering(false)
    }
  }

  const handleAcceptWaiver = () => {
    setWaiverRead(true)
    setWaiverAccepted(true)
    setWaiverAcceptedAtTime(new Date())
    setShowWaiverModal(false)
  }

  const participantAge = getParticipantAge(user?.birthDate)
  const relevantCategories = selectedModality
    ? eventCategories.filter((c) => c.modalityId == null || c.modalityId === selectedModality.id)
    : eventCategories
  const suggestedCategory = getSuggestedCategory(relevantCategories, participantAge)
  const effectivePrice = calculatePrice(selectedModality, wantsShirt)
  const participantFullName =
    [participantFormData.firstName, participantFormData.lastName].filter(Boolean).join(' ') || 'Participante'
  const hasModalities = eventModalities.length > 0
  const hasCategories = relevantCategories.length > 0

  const allSteps: StepDescriptor[] = (() => {
    const base: { key: RegistrationStep; label: string }[] = [{ key: 'profile', label: 'Datos' }]
    if (hasModalities) base.push({ key: 'modality', label: 'Modalidad' })
    if (hasCategories || eventCategories.length > 0) base.push({ key: 'category', label: 'Categoría' })
    base.push({ key: 'confirm', label: 'Confirmar' })
    base.push({ key: 'success', label: 'Listo' })
    return base.map((s, i) => ({ ...s, number: i + 1 }))
  })()

  const currentStepIndex = allSteps.findIndex((s) => s.key === step)

  return {
    event,
    eventModalities,
    eventCategories,
    relevantCategories,
    selectedModality,
    selectedCategory,
    ticketCode,
    allSteps,
    currentStepIndex,
    suggestedCategory,
    participantAge,
    effectivePrice,
    participantFullName,
    hasModalities,
    hasCategories,
    step,
    setStep,
    handleSelectModality,
    setSelectedCategory,
    wantsShirt,
    setWantsShirt,
    waiverRead,
    waiverAccepted,
    setWaiverAccepted,
    waiverAcceptedAtTime,
    showWaiverModal,
    setShowWaiverModal,
    handleAcceptWaiver,
    participantFormData,
    setParticipantFormData,
    profileError,
    handleNextFromProfile,
    isRegistering,
    registerError,
    handleRegister,
    isPageLoading,
  }
}
