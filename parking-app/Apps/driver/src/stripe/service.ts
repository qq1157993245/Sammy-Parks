import { StripeResponse, CheckoutItem } from '.'

export async function createSession(
  checkoutItem: CheckoutItem
): Promise<StripeResponse> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5850/api/v0/payment/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        productName: checkoutItem.productName,
        currency: checkoutItem.currency,
        amount: checkoutItem.amount,
        url: checkoutItem.url,
      })
    })
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        resolve(json.url)
      })
      .catch(() => reject('Unauthorized'))
  })
}
