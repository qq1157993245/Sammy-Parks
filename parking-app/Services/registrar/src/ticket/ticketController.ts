import {
  Controller,
  Get,
  Route,
  SuccessResponse,
  Query,
  Response,
  Security
} from 'tsoa'

import { TicketService } from './ticketService'
import { getIdByEmail } from '../auth/service'
import { Ticket } from '.'

@Route('ticket')
export class TicketController extends Controller {

  @Get('check')
  @Security('api_key')
  @SuccessResponse('200', 'OK')
  @Response('404', 'Ticket not found')
  public async checkTicket(
    @Query() email: string
  ): Promise<Ticket[]|undefined> {
    const user = await getIdByEmail(email)
    if (!user) {
      this.setStatus(404)
      return undefined
    }

    const ticket = await new TicketService()
      .checkTicket(user?.id as string, user?.accessToken as string)

    if (!ticket) {
      this.setStatus(404)
      return undefined
    }
    this.setStatus(200)
    return ticket
  }
}