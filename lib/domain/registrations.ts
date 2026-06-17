import type { ParticipantProfileResponse, EventModalityResponse, EventCategoryResponse } from '../types'

export function isProfileComplete(p: ParticipantProfileResponse): boolean {
  return !!(p.shirtSize && p.bloodType && p.emergencyContactName && p.emergencyContactPhone)
}

export function calculatePrice(
  modality: Pick<EventModalityResponse, 'price' | 'priceWithoutShirt'> | null,
  wantsShirt: boolean | null
): number {
  if (!modality) return 0
  if (wantsShirt === false && modality.priceWithoutShirt != null) {
    return modality.priceWithoutShirt
  }
  return modality.price
}

export function getSuggestedCategory(
  categories: EventCategoryResponse[],
  ageYears: number | null
): EventCategoryResponse | null {
  if (ageYears == null) return null
  return (
    categories.find((c) => {
      const minOk = c.minAge == null || ageYears >= c.minAge
      const maxOk = c.maxAge == null || ageYears <= c.maxAge
      return minOk && maxOk
    }) ?? null
  )
}

export function calculateServiceFee(basePrice: number): number {
  return Math.max(20, basePrice * 0.08)
}

export function getParticipantAge(birthDate?: string | null): number | null {
  if (!birthDate) return null
  return Math.floor(
    (new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  )
}
