'use server';

import type { Driver, Enforcer, TicketType, Vehicle} from './types';

import {
  getAllEnforcers,
  toggleEnforcerSuspension,
} from '@/services/enforcers';

import { getZoneMaxPermits, setZoneMaxPermits } from '../../services/permits';

import { getAllDrivers, toggleDriverSuspension } from '@/services/drivers';
import { getAllTickets, overrideTicket, resolveChallenge, listTypes, setPrice } from '../../services/tickets';
import { fetchVehicleByDriverId } from '@/services/vehicles';

// === Driver Functions ===
export async function getDriverAccounts(): Promise<Driver[]> {
  console.log('Fetching all drivers for admin');
  const drivers = await getAllDrivers();
  return drivers.map(d => ({
    ...d,
    status: d.suspended ? 'suspended' : 'active'
  }));
}

export async function toggleDriverAccount(id: string, activate: boolean) {
  return await toggleDriverSuspension(id, activate);
}

// === Enforcer Functions ===
export async function getEnforcementAccounts(): Promise<Enforcer[]> {
  const enforcers = await getAllEnforcers();
  return enforcers.map(e => ({
    ...e,
    status: e.suspended ? 'suspended' : 'active'
  }));
}

export async function toggleEnforcerAccount(id: string, activate: boolean) {
  return await toggleEnforcerSuspension(id, activate);
}

// === Ticket Functions ===
export async function fetchTicketsForAdmin() {
  const tickets = await getAllTickets();
  return tickets;
}

export async function overrideTicketAction(id: string) {
  return await overrideTicket(id);
}


export async function resolveChallengeAction(id: string, accept: boolean) {
  return await resolveChallenge(id, accept);
}

export async function listTypesAction (): Promise<TicketType[]> {
  return await listTypes();
}

export async function setPriceAction (id: string, price: number): Promise<TicketType> {
  return await setPrice(id, price);
}

// === Vehicle Functions ===
export async function getVehicleByDriverIdForAdmin(driverId: string): Promise<Vehicle | null> {
  console.log('Fetching vehicle for driver ID:', driverId);
  return await fetchVehicleByDriverId(driverId);
}

// === Permit Functions ===
export async function fetchZoneMaxPermits(zone: string): Promise<number | null> {
  return await getZoneMaxPermits(zone);
}

export async function updateZoneMaxPermits(zone: string, limit: number): Promise<boolean> {
  return await setZoneMaxPermits(zone, limit);
}
