import { cookies } from 'next/headers';

export async function getZoneMaxPermits(zone: string): Promise<number | null> {
  const token = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5050/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetZoneMaxPermits($zone: String!) {
          getZoneMaxPermits(zone: $zone)
        }
      `,
      variables: { zone },
    }),
  });

  const { data, errors } = await res.json();

  if (!res.ok || errors) {
    console.error('Failed to fetch zone max permits', errors);
    return null;
  }

  return data.getZoneMaxPermits;
}

export async function setZoneMaxPermits(zone: string, limit: number): Promise<boolean> {
  const token = (await cookies()).get('session')?.value;

  const res = await fetch('http://localhost:5050/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation SetZoneMaxPermits($zone: String!, $limit: Int!) {
          setZoneMaxPermits(zone: $zone, limit: $limit)
        }
      `,
      variables: { zone, limit },
    }),
  });

  const { data, errors } = await res.json();

  if (!res.ok || errors) {
    console.error('Failed to set zone max permits', errors);
    return false;
  }

  return data.setZoneMaxPermits;
}