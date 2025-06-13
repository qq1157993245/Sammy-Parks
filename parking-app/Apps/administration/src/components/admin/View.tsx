'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  toggleDriverAccount,
  toggleEnforcerAccount,
  overrideTicketAction,
  listTypesAction,
  fetchZoneMaxPermits,
  updateZoneMaxPermits,
  resolveChallengeAction,
  setPriceAction,
  getVehicleByDriverIdForAdmin,
} from './actions';

import type { Driver, Enforcer, Ticket, TicketType, Vehicle } from './types';

import MenuDrawer from '../MenuDrawer';

interface Props {
  driverAccounts: Driver[];
  enforcementAccounts: Enforcer[];
  tickets: Ticket[];
}

export default function AdministrationView({
  driverAccounts,
  enforcementAccounts,
  tickets,
}: Props) {
  const [drivers, setDrivers] = useState(driverAccounts);
  const [enforcers, setEnforcers] = useState(enforcementAccounts);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [fees, setFees] = useState<number[]>([]);
  const [ticketList, setTicketList] = useState(tickets);
  const [isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  const zones = ['A', 'MC', 'R'] as const;
  const [zonePermits, setZonePermits] = useState<
    Record<string, { current: number | null; newLimit: number }>
  >({
    A: { current: null, newLimit: 1 },
    MC: { current: null, newLimit: 1 },
    R: { current: null, newLimit: 1 },
  });

  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  // const enforcerMap = Object.fromEntries(enforcers.map((e) => [e.id, e.name]));

  // Fetch vehicle information (including license plates) for each driver who received a ticket
  useEffect(() => {
    zones.forEach((zone) => {
      fetchZoneMaxPermits(zone).then((current) => {
        const validCurrent = typeof current === 'number' ? current : 1;
        setZonePermits((prev) => ({
          ...prev,
          [zone]: { current: validCurrent, newLimit: validCurrent },
        }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const types = await listTypesAction();
      setTicketTypes(types);
      setFees(new Array(types.length).fill(0));
    };
    fetchData();
  }, []);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const fetchVehicles = async () => {
      console.log("Fetching vehicle data for tickets...");
      const vehicleMap: Record<string, Vehicle> = {};

      for (const ticketItem of tickets) {
        const driverId = ticketItem.data.driverId;
        if (!driverId) continue;
        console.log("Fetching vehicle for driver ID:", driverId);
        try {
          const vehicle = await getVehicleByDriverIdForAdmin(driverId);
          if (vehicle) {
            vehicleMap[driverId] = vehicle;
          } else {
            vehicleMap[driverId] = {
              plate: 'N/A',
              id: driverId,
              state: 'N/A',
            };
          }
        } catch (err) {
          console.error(`Failed to fetch vehicle for ${driverId}`, err);
          vehicleMap[driverId] = {
            plate: 'N/A',
            id: driverId,
            state: 'N/A',
          };
        }
      }

      setVehicles(vehicleMap);
    };

    fetchVehicles();
  }, [tickets]);

  if (!isClient) return null;

  const toggleStatus = (
    id: string,
    currentStatus: 'active' | 'suspended',
    type: 'driver' | 'enforcer'
  ) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    startTransition(() => {
      if (type === 'driver') {
        toggleDriverAccount(id, newStatus === 'active');
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, status: newStatus } : d
          )
        );
      } else {
        toggleEnforcerAccount(id, newStatus === 'active');
        setEnforcers((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: newStatus } : e
          )
        );
      }
    });
  };

  const handleOverride = (id: string) => {
    startTransition(() => {
      overrideTicketAction(id).then(() => {
        setTicketList((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, data: { ...t.data, overridden: true } }
              : t
          )
        );
      });
    });
  };

  const handleResolveChallenge = (id: string, accept: boolean) => {
    startTransition(() => {
      resolveChallengeAction(id, accept).then(() => {
        setTicketList((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  data: {
                    ...t.data,
                    challenged: false,
                    challengeMessage: '',
                  },
                }
              : t
          )
        );
      });
    });
  };

  const handleSetPrice = (id: string, price: number) => {
    startTransition(() => {
      setPriceAction(id, price).then((x) => {
        setTicketTypes((types) =>
          types.map((type) => {
            if (type.id === id) {
              return {
                id: type.id,
                violation: type.violation,
                price: x.price,
              };
            }
            return type;
          })
        );
      });
    });
  };

  return (
    <MenuDrawer
      drivers={drivers}
      enforcers={enforcers}
      tickets={ticketList}
      ticketTypes={ticketTypes}
      zonePermits={zonePermits}
      setZonePermits={setZonePermits}
      fees={fees}
      setFees={setFees}
      isPending={isPending}
      toggleStatus={toggleStatus}
      handleSetPrice={handleSetPrice}
      handleOverride={handleOverride}
      handleResolveChallenge={handleResolveChallenge}
      updateZoneMaxPermits={updateZoneMaxPermits}
      vehicles={vehicles}
    />
  );
}
