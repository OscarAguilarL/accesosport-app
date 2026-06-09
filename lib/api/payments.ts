import { fetchApi } from './client'
import type {
  CheckoutSessionResponse,
  PaymentStatusResponse,
  ConnectOnboardingResponse,
  ConnectStatusResponse,
} from '../types'

export const payments = {
  createCheckoutSession: (registrationId: string, successUrl: string, cancelUrl: string) =>
    fetchApi<CheckoutSessionResponse>('/api/v1/payments/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ registrationId, successUrl, cancelUrl }),
    }),

  getPaymentStatus: (registrationId: string) =>
    fetchApi<PaymentStatusResponse>(`/api/v1/payments/registration/${registrationId}`),

  getConnectStatus: () =>
    fetchApi<ConnectStatusResponse>('/api/v1/stripe/connect/status'),

  startOnboarding: (returnUrl: string, refreshUrl: string) =>
    fetchApi<ConnectOnboardingResponse>('/api/v1/stripe/connect/onboard', {
      method: 'POST',
      body: JSON.stringify({ returnUrl, refreshUrl }),
    }),
}
