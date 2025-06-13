'use server'

import { extractCookie } from '@/auth/service';
import { PlateService } from '@/check-plate/service';
import { cookies } from 'next/headers'
import { TicketService } from "@/ticket/service"
import { TicketType } from "@/ticket"

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function checkPermit (plate: string) {
  const cookie = await extractCookie();
    if (!cookie) {
        return {success: 0, message: 'Unauthorized'}
    }
  const result = await new PlateService().checkPlate(cookie, plate);
  if (result.data) {
    return {success: 1, result , message: 'Vehicle has a permit'}
  } else {
    return {success: 0, message: result.errors[0].message}
  }
}

export async function createTicket (licensePlate: string, violation: string) {
    const cookie = await extractCookie();
    if (!cookie) {
        return {success: 0, message: 'Unauthorized'}
    }

    const result = await new TicketService().createTicket(cookie, licensePlate, violation);
    if (result.data) {
        return {success: 1, message: 'A ticket is created'}
    } else {
        return {success: 0, message: 'Internal Server Error'}
    }
}

export async function listTypes (): Promise<TicketType[]> {
    const cookie = await extractCookie();
    return await new TicketService().listTypes(cookie);
}
