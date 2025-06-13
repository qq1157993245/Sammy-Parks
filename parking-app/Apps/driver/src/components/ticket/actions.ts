'use server';

import { cookies } from 'next/headers';
import { getTicketsForDriver, markTicketAsPaid, challengeTicket } from '@/ticket/service';

export async function fetchTicketsForCurrentDriver() {
  const cookie = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/check', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to validate session');
  }

  const data = await res.json();
  console.log('Check response:', data);

  const driverId = data.id;

  return getTicketsForDriver(driverId);
}

export async function markCurrentDriverTicketAsPaid(ticketId: string): Promise<void> {
  const cookie = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/check', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to validate session');
  }

  const data = await res.json();
  const driverId = data.id;
  if (!driverId) throw new Error('Driver ID missing from check response');

  // Optionally, confirm this ticket belongs to this driver
  await markTicketAsPaid(ticketId);
}

export async function challengeTicketForCurrentDriver(ticketId: string, message: string): Promise<void> {
  const cookie = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/check', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to validate session');
  }

  const data = await res.json();
  const driverId = data.id;
  if (!driverId) throw new Error('Driver ID missing from check response');

  // Call the service function to challenge the ticket
  await challengeTicket(ticketId, message);
}
