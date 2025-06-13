
import { Driver } from '../components/admin/types';
import { cookies } from 'next/headers';

export async function getAllDrivers(): Promise<Driver[]> {
  const token = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/drivers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to load drivers');

  const drivers: Omit<Driver, 'status'>[] = await res.json();

  return drivers.map((d) => ({
    ...d,
    status: d.suspended ? 'suspended' : 'active',
  }));
}


export async function toggleDriverSuspension(id: string, activate: boolean): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/suspend-driver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, suspend: !activate }),
  });

  if (!res.ok) throw new Error('Failed to toggle driver suspension');
}
