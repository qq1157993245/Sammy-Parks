'use server'

import { cookies } from 'next/headers'
import { Vehicle, NewVehicle } from "@/vehicle"
import { list, add } from "@/vehicle/service"

export async function listAction(): Promise<Vehicle[]> {
  const cookie = (await cookies()).get('session')?.value
  return list(cookie)
}

export async function addAction(vehicle: NewVehicle): Promise<Vehicle> {
  const cookie = (await cookies()).get('session')?.value
  return add(cookie, vehicle)
}
