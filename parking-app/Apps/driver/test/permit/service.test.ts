import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PermitService } from '../../src/permit/service'

let service: PermitService

beforeEach(() => {
  service = new PermitService()
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

const mockTypes = [{
  id: '1',
  type: 'Day',
  day_duration: 1,
  month_duration: 0,
  price: 10
}]

const mockPermits = [{
  id: '1',
  vehicleId: '1',
  startTime: new Date().toString(),
  endTime: new Date().toString(),
  plate: 'ABC123',
  zone: 'Zone 1'
}]

const mockZones = [{
  id: '1',
  zone: 'Zone 1',
  maxPermits: 100
}]

const mockPermit = {
  id: '1',
  vehicleId: 'v1',
  startTime: 'now',
  endTime: 'later'
}


it('listTypes throws error when no cookie is provided', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ data: { getPermitTypes: mockTypes } }),
  })

  await expect(service.listTypes(undefined))
    .rejects.toThrow('Unauthorized')
})

it('listTypes: GraphQL throws an error', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ errors: [{ message: 'GraphQL Errors in listTypes' }] }),
  })

  await expect(service.listTypes('token')).rejects.toThrow()
})

it('listTypes: fetch throws error', async () => {
  (fetch as any).mockRejectedValue(new Error('Network error'))

  await expect(service.listTypes('token')).rejects.toThrow('Network error')
})

it('listTypes calls fetch and returns permit types', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ data: { getPermitTypes: mockTypes } }),
  })

  const result = await service.listTypes('token')
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:5050/graphql',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    })
  )
  expect(result).toEqual(mockTypes)
})


it('list: GraphQL throws an error', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ errors: [{
      message: 'GraphQL Errors in list'
    }]}),
  })

  await expect(service.list('token')).rejects.toThrow()
})

it('list: fetch throws error', async () => {
  (fetch as any).mockRejectedValue(new Error('Network error'))

  await expect(service.list('token'))
    .rejects.toThrow('Network error')
})

it('list calls fetch and returns permits', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ data: { getPermitsByDriver: mockPermits } }),
  })

  const result = await service.list('token')
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:5050/graphql',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    })
  )
  expect(result).toEqual(mockPermits)
})


it('listZones: GraphQL throws an error', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ errors: [{
      message: 'GraphQL Errors in listZones'
    }]}),
  })

  await expect(service.listZones('token')).rejects.toThrow()
})

it('listZones calls fetch and returns zones', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ data: { getZoneTypes: mockZones } }),
  })

  const result = await service.listZones('token')
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:5050/graphql',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    })
  )
  expect(result).toEqual(mockZones)
})


it('add: GraphQL throws an error', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ errors: [{
      message: 'GraphQL Errors in add'
    }]}),
  })

  await expect(service.add('token', 'type1', 'zone1', 'veh1'))
    .rejects.toThrow()
})

it('add: fetch throws error', async () => {
  (fetch as any).mockRejectedValue(new Error('Network error'))

  await expect(service.add('token', 'type1', 'zone1', 'veh1'))
    .rejects.toThrow('Network error')
})

it('add calls fetch and returns data', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ data: {  } }),
  })

  const result = await service.add('token', 'type1', 'zone1', 'veh1')
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:5050/graphql',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    })
  )
  expect(result).toEqual(undefined)
})


it('getPermitCountInZone: No Cookie', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ errors: [{ message: 'GraphQL Errors in getPermitCountInZone' }] }),
  });

  await expect(service.getPermitCountInZone(undefined, 'Zone A')).rejects.toThrow();
});

it('getPermitCountInZone: GraphQL throws an error', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ errors: [{ message: 'GraphQL Errors in getPermitCountInZone' }] }),
  });

  await expect(service.getPermitCountInZone('token', 'Zone A')).rejects.toThrow();
});

it('getPermitCountInZone: fetch throws error', async () => {
  (fetch as any).mockRejectedValue(new Error('Network error'));

  await expect(service.getPermitCountInZone('token', 'Zone A')).rejects.toThrow('Network error');
});

it('getPermitCountInZone returns count on success', async () => {
  (fetch as any).mockResolvedValueOnce({
    json: async () => ({ data: { getPermitCountInZone: 3 } }),
  });

  const result = await service.getPermitCountInZone('token', 'Zone A');
  expect(result).toBe(3);
});