/**
 * Resolves where to send the user after successful login/register.
 * Only allows known in-app portal paths to avoid open redirects.
 */
export function resolvePostAuthUrl(returnUrl: string | null | undefined): string {
  const fallback = '/dashboard';

  if (!returnUrl) {
    return fallback;
  }

  const trimmed = returnUrl.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
    return fallback;
  }

  const pathOnly = trimmed.split('?')[0]?.split('#')[0] ?? '';

  if (
    pathOnly === '/dashboard' ||
    pathOnly === '/advisor' ||
    pathOnly === '/profile' ||
    /^\/forms\/[A-Za-z0-9_-]+$/.test(pathOnly)
  ) {
    return trimmed;
  }

  return fallback;
}
