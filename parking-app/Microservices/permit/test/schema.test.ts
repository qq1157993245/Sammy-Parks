import 'reflect-metadata';
import { expect, it } from 'vitest';
import { Permit, PermitType, ZoneType, SetZoneLimitArgs } from '../src/permit/schema';

it('should create a Permit instance with correct values', () => {
  const permit = new Permit();
  permit.id = 'abc123';
  permit.driverId = 'driver1';
  permit.vehicleId = 'vehicle1';
  permit.permitTypeId = 'permitTypeA';
  // permit.zoneTypeId = 'zoneA';
  permit.startTime = '2024-01-01T00:00:00Z';
  permit.endTime = '2024-12-31T23:59:59Z';
  permit.plate = 'XYZ123';

  expect(permit).toBeDefined();
  expect(permit.id).toBe('abc123');
  expect(permit.driverId).toBe('driver1');
  expect(permit.vehicleId).toBe('vehicle1');
  expect(permit.permitTypeId).toBe('permitTypeA');
  // expect(permit.zoneTypeId).toBe('zoneA');
  expect(permit.startTime).toBe('2024-01-01T00:00:00Z');
  expect(permit.endTime).toBe('2024-12-31T23:59:59Z');
  expect(permit.plate).toBe('XYZ123');
});

it('should create a PermitType instance with correct values', () => {
  const permitType = new PermitType();
  permitType.id = 'pid123';
  permitType.type = 'Monthly';
  permitType.day_duration = 30;
  permitType.month_duration = 1;
  permitType.price = 50;
  permitType.totalAmount = 100;

  expect(permitType.id).toBe('pid123');
  expect(permitType.type).toBe('Monthly');
  expect(permitType.day_duration).toBe(30);
  expect(permitType.month_duration).toBe(1);
  expect(permitType.price).toBe(50);
  expect(permitType.totalAmount).toBe(100);
});

it('should create a ZoneType instance with correct values', () => {
  const zoneType = new ZoneType();
  zoneType.id = 'ztid456';
  zoneType.zone = 'A';
  zoneType.maxPermits = 20;

  expect(zoneType.id).toBe('ztid456');
  expect(zoneType.zone).toBe('A');
  expect(zoneType.maxPermits).toBe(20);
});

it('should create a SetZoneLimitArgs instance with correct values', () => {
  const args = new SetZoneLimitArgs();
  args.zone = 'B';
  args.limit = 10;

  expect(args.zone).toBe('B');
  expect(args.limit).toBe(10);
});
