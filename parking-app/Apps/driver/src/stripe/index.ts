export interface StripeResponse {
  url: string
}

export interface CheckoutItem {
  productName: string
  currency: string
  amount: number
  url: string
}