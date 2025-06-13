import {vi, expect, it} from 'vitest'

import { PermitService } from '../src/permit/service'
import { pool } from '../src/db'

it('returns false if no zone is updated', async () => {
  pool.query = vi.fn().mockResolvedValue({ rowCount: 0 });
  const service = new PermitService();
  const result = await service.setZoneMaxPermits('nonexistent-zone', 10);
  expect(result).toBe(false);
});

it('returns false if no zone is updated and returns undefined', async () => {
  pool.query = vi.fn().mockResolvedValue({ rowCount: undefined });
  const service = new PermitService();
  const result = await service.setZoneMaxPermits('nonexistent-zone', 10);
  expect(result).toBe(false);
});

it('returns true if zone is updated', async () => {
  pool.query = vi.fn().mockResolvedValue({ rowCount: 1 });
  const service = new PermitService();
  const result = await service.setZoneMaxPermits('A', 10);
  expect(result).toBe(true);
});