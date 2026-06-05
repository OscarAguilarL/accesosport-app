'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  events as eventsApi,
  profile as profileApi,
  registrations as registrationsApi,
  modalities as modalitiesApi,
  categories as categoriesApi,
  ApiError,
} from '../api'
import {
  isProfileComplete,
  calculatePrice,
  getSuggestedCategory,
  getParticipantAge,
} from '../domain/registrations'
import { useAuth } from '../auth-context'
import type {
  EventResponse,
  CreateParticipantProfileRequest,
  ShirtSize,
  BloodType,
  Gender,
  EventModalityResponse,
  EventCategoryResponse,
} from '../types'

export type RegistrationStep = 'profile' | 'modality' | 'category' | 'confirm' | 'success'

export interface StepDescriptor {
  key: RegistrationStep
  label: string
  number: number
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

  showProfileForm: boolean
  profileFormData: CreateParticipantProfileRequest
  setProfileFormData: (v: CreateParticipantProfileRequest) => void
  isSavingProfile: boolean
  profileError: string | null
  handleSaveProfile: (e: React.FormEvent) => Promise<void>

  isRegistering: boolean
  registerError: string | null
  handleRegister: () => Promise<void>

  isPageLoading: boolean
}

const DEFAULT_PROFILE: CreateParticipantProfileRequest = {
  shirtSize: 'SIZE_M' as ShirtSize,
  bloodType: 'O_POSITIVE' as BloodType,
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalConditions: '',
  phone: '',
  gender: 'FEMENIL' as Gender,
}

export function useRegistrationFlow(eventId: string): UseRegistrationFlowResult {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUser } = useAuth()

  const [step, setStep] = useState<RegistrationStep>('profile')
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [eventModalities, setEventModalities] = useState<EventModalityResponse[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategoryResponse[]>([])
  const [selectedModality, setSelectedModality] = useState<EventModalityResponse | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryResponse | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [ticketCode, setTicketCode] = useState('')

  const [profileFormData, setProfileFormData] = useState<CreateParticipantProfileRequest>(DEFAULT_PROFILE)
  const [profileExists, setProfileExists] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [wantsShirt, setWantsShirt] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const [waiverRead, setWaiverRead] = useState(false)
  const [waiverAccepted, setWaiverAccepted] = useState(false)
  const [showWaiverModal, setShowWaiverModal] = useState(false)
  const [waiverAcceptedAtTime, setWaiverAcceptedAtTime] = useState<Date | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/eventos/${eventId}/inscribirse`)}`)
    }
  }, [isAuthenticated, isAuthLoading, router, eventId])

  useEffect(() => {
    if (!isAuthenticated) return

    Promise.all([
      eventsApi.get(eventId),
      modalitiesApi.list(eventId).catch(() => [] as EventModalityResponse[]),
      categoriesApi.list(eventId).catch(() => [] as EventCategoryResponse[]),
      profileApi.getParticipant().catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }),
    ])
      .then(([eventData, modalitiesData, categoriesData, profileData]) => {
        setEvent(eventData)
        setEventModalities(modalitiesData)
        setEventCategories(categoriesData)
        if (!profileData || !isProfileComplete(profileData)) {
          if (profileData?.shirtSize) {
            setProfileExists(true)
            setProfileFormData({
              shirtSize: profileData.shirtSize,
              bloodType: profileData.bloodType ?? 'O_POSITIVE',
              emergencyContactName: profileData.emergencyContactName ?? '',
              emergencyContactPhone: profileData.emergencyContactPhone ?? '',
              medicalConditions: profileData.medicalConditions ?? '',
              phone: profileData.phone ?? '',
              gender: profileData.gender ?? 'FEMENIL',
            })
          }
          setShowProfileForm(true)
        } else if (modalitiesData.length > 0) {
          setStep('modality')
        } else if (categoriesData.length > 0) {
          setStep('category')
        } else {
          setStep('confirm')
        }
      })
      .catch((err: unknown) => {
        setProfileError(err instanceof ApiError ? (err.detail || err.message) : 'Error al cargar los datos.')
      })
      .finally(() => setIsPageLoading(false))
  }, [isAuthenticated, eventId])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileError(null)
    try {
      const payload = { ...profileFormData, medicalConditions: profileFormData.medicalConditions || undefined }
      if (profileExists) {
        await profileApi.updateParticipant(payload)
      } else {
        const result = await profileApi.createParticipant(payload)
        localStorage.setItem('accessToken', result.token)
        await refreshUser()
      }
      setShowProfileForm(false)
      if (eventModalities.length > 0) {
        setStep('modality')
      } else if (eventCategories.length > 0) {
        setStep('category')
      } else {
        setStep('confirm')
      }
    } catch (err) {
      setProfileError(err instanceof ApiError ? (err.detail || err.message) : 'Error al guardar el perfil.')
    } finally {
      setIsSavingProfile(false)
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
      const reg = await registrationsApi.register(
        eventId,
        selectedModality?.id,
        selectedCategory?.id,
        true,
        wantsShirt ?? true
      )
      setTicketCode(reg.ticketCode)
      setStep('success')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setRegisterError('Ya estás inscrito en este evento.')
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
    const now = new Date()
    setWaiverRead(true)
    setWaiverAccepted(true)
    setWaiverAcceptedAtTime(now)
    setShowWaiverModal(false)
  }

  const participantAge = getParticipantAge(user?.birthDate)
  const relevantCategories = selectedModality
    ? eventCategories.filter((c) => c.modalityId == null || c.modalityId === selectedModality.id)
    : eventCategories
  const suggestedCategory = getSuggestedCategory(relevantCategories, participantAge)
  const effectivePrice = calculatePrice(selectedModality, wantsShirt)
  const participantFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Participante'
  const hasModalities = eventModalities.length > 0
  const hasCategories = relevantCategories.length > 0

  const allSteps: StepDescriptor[] = (() => {
    const base: { key: RegistrationStep; label: string }[] = [{ key: 'profile', label: 'Perfil' }]
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
    showProfileForm,
    profileFormData,
    setProfileFormData,
    isSavingProfile,
    profileError,
    handleSaveProfile,
    isRegistering,
    registerError,
    handleRegister,
    isPageLoading,
  }
}
