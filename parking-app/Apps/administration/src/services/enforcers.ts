import { cookies } from 'next/headers';
import { Enforcer } from '../components/admin/types';

export async function getAllEnforcers(): Promise<Enforcer[]> {
  const token = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/enforcers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to load enforcers');
  const enforcers: Omit<Enforcer, 'status'>[] = await res.json();

  return enforcers.map((e) => ({
    ...e,
    status: e.suspended ? 'suspended' : 'active',
  }));
}

// Toggle suspension (activate = true means suspended: false)
export async function toggleEnforcerSuspension(id: string, activate: boolean): Promise<void> {
  const token = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5200/api/v0/suspend-enforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, suspend: !activate })
  });

  if (!res.ok) throw new Error('Failed to toggle enforcer suspension');
}
