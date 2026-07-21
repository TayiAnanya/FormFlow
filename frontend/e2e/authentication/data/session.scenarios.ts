import { ROUTES } from '../../shared/config/constants';

/**
 * Session persistence / reload scenario paths (values only).
 * Specs navigate and reload; no Playwright here.
 */
export const sessionScenarios = {
  /** Authenticated reload restores session (S10 / AUT-AUTH-09). */
  reloadWhileAuthenticated: {
    path: ROUTES.dashboard,
  },
  /** Guest on login remains guest after refresh. */
  reloadAsGuestOnLogin: {
    path: ROUTES.login,
  },
  /** After logout, protected URL must not restore prior session via back nav. */
  protectedAfterLogout: {
    path: ROUTES.dashboard,
  },
  /** Post-auth default destination used by guestGuard / resolvePostAuthUrl. */
  postAuthDefault: {
    path: ROUTES.dashboard,
  },
  /** Guest auth surfaces for landing entry (S01). */
  landingEntry: {
    landing: ROUTES.landing,
    login: ROUTES.login,
    register: ROUTES.register,
  },
  /** Authenticated user hitting guest-only routes (S09 / AUT-AUTH-08). */
  guestGuardTargets: {
    login: ROUTES.login,
    register: ROUTES.register,
    landing: ROUTES.landing,
  },
} as const;
