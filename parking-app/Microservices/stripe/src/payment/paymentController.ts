import {
  Body,
  Controller,
  Post,
  Route,
  SuccessResponse
} from 'tsoa'

import { PaymentService } from './paymentService'
import { StripeResponse, CheckoutItem } from '.'

@Route('payment')
export class PaymentController extends Controller {
  @Post('create-session')
  @SuccessResponse('201', 'Created')
  public async createPayment(
    @Body() requestBody: CheckoutItem
  ): Promise<StripeResponse|undefined> {
    const paymentService = new PaymentService()
    const result = await paymentService.createPayment(requestBody)
    if (result === undefined) {
      throw new Error('Invalid request')
    }
    if (result.url === '') {
      this.setStatus(404)
      return undefined
    }
    this.setStatus(201)
    return result
  }
}