import { describe, it, expect, vi, beforeEach } from 'vitest';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'; // adjust path as needed
import * as grabModule from '@/auth/service'; // adjust path to your actual service
import * as jsonwebtoken from 'jsonwebtoken';
import type { JWT } from 'next-auth/jwt';

vi.mock('@/auth/service', () => ({
  grabuuidfromoauth: vi.fn(() => Promise.resolve('mock-uuid')),
}));

describe('authOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callbacks.jwt', () => {
    /*it('adds roles and uuid if account and profile exist', async () => {
      const token: JWT = {};
      const account = { providerAccountId: '12345' };
      const profile = { email: 'user@example.com' };

      const result = await authOptions.callbacks.jwt({ token, profile });

      expect(result.roles).toEqual(['driver']);
      expect(result.id).toBe('mock-uuid');
      expect(grabModule.grabuuidfromoauth).toHaveBeenCalledWith('12345', 'user@example.com');
    });*/

    it('returns token unchanged if account or profile missing', async () => {
      const token: JWT = { existing: 'yes' } as any;
      const result = await authOptions.callbacks.jwt({ token });
      expect(result).toEqual(token);
    });

    /* it('handles error in grabuuidfromoauth gracefully', async () => {
      vi.spyOn(grabModule, 'grabuuidfromoauth').mockRejectedValueOnce(new Error('fail'));

      const token: JWT = {};
      const account = { providerAccountId: 'err' };
      const profile = { email: 'fail@example.com' };

      const result = await authOptions.callbacks.jwt({ token,  profile });

      expect(result.roles).toEqual(['driver']);
      expect(result.id).toBeUndefined();
    });*/
  });

  describe('callbacks.session', () => {
    it('attaches uuid and roles to session', async () => {
      const token: JWT = { id: 'uuid-123', role: ['driver'] };
      const session = { user: {} } as any;

      const result = await authOptions.callbacks.session({ session, token });

      expect(result.user.uuid).toBe('uuid-123');
      expect(result.user.roles).toEqual(['driver']);
    });
  });

  describe('jwt.encode', () => {
    it('signs token with HS256', async () => {
      const token = { foo: 'bar' };
      const secret = 'mysecret';

      const result = await authOptions.jwt.encode({ token, secret });

      expect(typeof result).toBe('string');

      const decoded = jsonwebtoken.verify(result, secret);
      expect((decoded as any).foo).toBe('bar');
    });

    it('throws if token or secret is missing', async () => {
      // @ts-ignore
      await expect(authOptions.jwt.encode({})).rejects.toThrow('Missing token or secret');
    });
  });

  describe('jwt.decode', () => {
    it('decodes valid token', async () => {
      const signed = jsonwebtoken.sign({ hello: 'world' }, 'secret');
      const result = await authOptions.jwt.decode({ token: signed, secret: 'secret' });

      expect(result?.hello).toBe('world');
    });

    it('returns null on invalid token', async () => {
      const result = await authOptions.jwt.decode({
        token: 'invalid.token.string',
        secret: 'secret',
      });

      expect(result).toBeNull();
    });
  });
});
