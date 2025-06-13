'use server'

import { CheckoutItem } from "@/stripe"
import { createSession } from "@/stripe/service"

export async function createCheckout(
  item: CheckoutItem
): Promise<string> {
  return (await createSession(item)) as unknown as string
}
