import { resolvePostAuthUrl } from './resolve-post-auth-url';

describe('resolvePostAuthUrl', () => {
  it('defaults to dashboard when returnUrl is missing', () => {
    expect(resolvePostAuthUrl(null)).toBe('/dashboard');
    expect(resolvePostAuthUrl(undefined)).toBe('/dashboard');
    expect(resolvePostAuthUrl('')).toBe('/dashboard');
  });

  it('allows known portal paths', () => {
    expect(resolvePostAuthUrl('/forms/loan-inquiry')).toBe('/forms/loan-inquiry');
    expect(resolvePostAuthUrl('/advisor')).toBe('/advisor');
    expect(resolvePostAuthUrl('/profile')).toBe('/profile');
    expect(resolvePostAuthUrl('/dashboard')).toBe('/dashboard');
  });

  it('rejects external or unknown paths', () => {
    expect(resolvePostAuthUrl('https://evil.example')).toBe('/dashboard');
    expect(resolvePostAuthUrl('//evil.example')).toBe('/dashboard');
    expect(resolvePostAuthUrl('/login')).toBe('/dashboard');
    expect(resolvePostAuthUrl('/forms/../login')).toBe('/dashboard');
  });
});
