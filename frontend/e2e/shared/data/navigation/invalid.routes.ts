import { publicRoutes } from './public.routes';
import { shellRoutes } from './shell.routes';

/**
 * Unknown / invalid paths — app wildcard `**` redirects to `''` (landing).
 * Authenticated guests of `''` are then sent to post-auth default by guestGuard.
 */
export const invalidRoutes = {
  unknownPage: '/this-route-does-not-exist',
  adminSecret: '/admin/secret',
  nonsense: '/zzz/not-a-real-module',
} as const;

export const invalidRouteList = [
  invalidRoutes.unknownPage,
  invalidRoutes.adminSecret,
  invalidRoutes.nonsense,
] as const;

/**
 * Expected outcomes after wildcard redirect (values for specs — not assertions here).
 */
export const invalidRouteExpectations = {
  /** Guest ends on landing. */
  asGuest: {
    path: publicRoutes.landing,
  },
  /** Authenticated user typically lands on dashboard after guestGuard. */
  asAuthenticated: {
    path: shellRoutes.dashboard,
  },
} as const;
