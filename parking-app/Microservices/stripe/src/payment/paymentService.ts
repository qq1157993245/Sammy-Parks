
import Stripe from 'stripe'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({
  path: path.resolve(__dirname, '../../../../.env')
})

import { StripeResponse, CheckoutItem } from '.'

const stripe = new Stripe(process.env.STRIPE_SECRET as string)

function checkURL(url: string): boolean {
  const regex = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?(\/.*)?$/
  return regex.test(url)
}

export class PaymentService {
  public async createPayment(
    requestBody: CheckoutItem
  ): Promise<StripeResponse|undefined> {
    const { amount, currency, productName, url } = requestBody
    if (amount <= 0) {
      return undefined
    }
    if (productName.length === 0) {
      return { url: '' }
    }
    if (!checkURL(url)) {
      return { url: '' }
    }
    const separator = url.includes('?') ? '&' : '?';

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: productName,
          },  
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${url}${separator}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: url,
    })

    return {
      url: session.url as string
    }
  }
}
