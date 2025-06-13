import { it, afterEach, vi, expect } from 'vitest';
import { login } from '@/components/login/action';
import { authenticate } from '@/auth/service';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('@/auth/service', () => ({
  authenticate: vi.fn(),
}));

const cookiesMock = {
  set: vi.fn(),
  get: vi.fn(),
};
vi.mock('next/headers', () => ({
  cookies: () => cookiesMock,
}));

it('login sets session cookie and returns user info', async () => {
  const user = { name: 'Test User', accessToken: 'token123' };
  (authenticate as any).mockResolvedValue(user);

  const credentials = { email: 'test@email.com', password: 'secret' };
  const result = await login(credentials);

  expect(authenticate).toHaveBeenCalledWith(credentials);
  expect(cookiesMock.set).toHaveBeenCalledWith(
    'session',
    user.accessToken,
    expect.objectContaining({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
  );
  expect(result).toEqual(user);
});

it('login returns undefined for invalid credentials', async () => {
  (authenticate as any).mockResolvedValue(undefined);

  const result = await login({ email: 'wrong', password: 'bad' });
  expect(result).toBeUndefined();
});