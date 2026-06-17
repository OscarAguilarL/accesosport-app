import { fetchApi } from './client'
import type {
  CheckoutSessionResponse,
  PaymentStatusResponse,
  ConnectOnboardingResponse,
  ConnectStatusResponse,
} from '../types'

const STORAGE_KEY = (registrationId: string) => `payment_access_token_${registrationId}`

export function savePaymentAccessToken(registrationId: string, token: string) {
  sessionStorage.setItem(STORAGE_KEY(registrationId), token)
}

export function getPaymentAccessToken(registrationId: string): string | null {
  return sessionStorage.getItem(STORAGE_KEY(registrationId))
}

export function clearPaymentAccessToken(registrationId: string) {
  sessionStorage.removeItem(STORAGE_KEY(registrationId))
}

export const payments = {
  createCheckoutSession: (registrationId: string, accessToken?: string | null) =>
    fetchApi<CheckoutSessionResponse>('/api/v1/payments/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ registrationId }),
      headers: accessToken ? { 'X-Registration-Access-Token': accessToken } : undefined,
    }),

  getPaymentStatus: (registrationId: string, accessToken?: string | null) =>
    fetchApi<PaymentStatusResponse>(`/api/v1/payments/registration/${registrationId}`, {
      headers: accessToken ? { 'X-Registration-Access-Token': accessToken } : undefined,
    }),

  getConnectStatus: () =>
    fetchApi<ConnectStatusResponse>('/api/v1/stripe/connect/status'),

  startOnboarding: () =>
    fetchApi<ConnectOnboardingResponse>('/api/v1/stripe/connect/onboard', {
      method: 'POST',
    }),
}
