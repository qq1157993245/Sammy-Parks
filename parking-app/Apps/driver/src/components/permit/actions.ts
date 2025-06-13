'use server'

import { cookies } from 'next/headers'
import { Permit, PermitType, PermitZone } from "@/permit"
import { PermitService } from "@/permit/service"

export async function listTypes(): Promise<PermitType[]> {
  const cookie = (await cookies()).get('session')?.value
  return new PermitService().listTypes(cookie)
}

export async function list(): Promise<Permit[]> {
  const cookie = (await cookies()).get('session')?.value
  return new PermitService().list(cookie)
}

export async function listZones(): Promise<PermitZone[]> {
  const cookie = (await cookies()).get('session')?.value
  return new PermitService().listZones(cookie)
}

export async function add(permitTypeId: string, zoneId: string, vehicleId: string): Promise<Permit> {
  const cookie = (await cookies()).get('session')?.value
  return new PermitService().add(cookie, permitTypeId, zoneId, vehicleId)
}

export async function getPermitCountInZone(zoneId: string): Promise<number> {
  const cookie = (await cookies()).get('session')?.value;
  return new PermitService().getPermitCountInZone(cookie, zoneId);
}
