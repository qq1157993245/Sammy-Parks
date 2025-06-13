import {
  Controller,
  Get,
  Route,
  SuccessResponse,
  Query,
  Response,
  Security
} from 'tsoa'

import { PermitService } from './permitService'
import { Permit } from '.'

@Route('permit')
export class PermitController extends Controller {

  @Get('check')
  @Security('api_key')
  @SuccessResponse('200', 'OK')
  @Response('404', 'Permit not found')
  @Response('500', 'Internal Server Error')
  public async checkPermit(
    @Query() vehiclePlate: string
  ): Promise<Permit | undefined> {
    if (!vehiclePlate || vehiclePlate.trim() === '') {
      this.setStatus(500)
      throw new Error('Vehicle plate is required')
    }

    const permitService = new PermitService()
    const res = await permitService.checkPermit(vehiclePlate)

    if (res) {
      this.setStatus(200)
      return {
        vehicleId: res.vehicleId,
        startTime: res.startTime,
        endTime: res.endTime,
        plate: res.plate,
        zone: res.zone
      }
    }

    this.setStatus(404)
    return undefined
  }
}