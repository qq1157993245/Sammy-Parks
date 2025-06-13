import { cookies } from 'next/headers';
import { Vehicle } from '@/components/admin/types';

const VEHICLE_API_URL = 'http://localhost:5150/graphql';

export async function fetchVehicleByDriverId(driverId: string): Promise<Vehicle | null> {
  if (!driverId) {
    console.error('HEEYYYY fetchVehicleByDriverId called with invalid driverId:', driverId);
    return null;
  }
  console.log('Fetching vehicle for driverId:', driverId);

  const query = `
    query {
      vehicleByDriverId(driverId: "${driverId}") {
        id
        plate
      }
    }
  `;

  const cookie = (await cookies()).get('session')?.value;
  console.log('Starting fetchVehicleByDriverId for driverId:', driverId);
  console.log('Token:', cookie);

  const res = await fetch(VEHICLE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Authorization: `Bearer ${cookie}` } : {})
    },
    body: JSON.stringify({ query }),
  });

  console.log('Response status:', res.status);
  const data = await res.json();
  console.log('Vehicle response data:', data);

  if (data.errors) {
    console.error('GraphQL vehicleById error:', data.errors);
    return null;
  }

  return data.data?.vehicleByDriverId || null;
}