import { ROUTES } from '../../config/constants';

/**
 * Authenticated shell primary routes (no fragments).
 * Values only — sourced from shared ROUTES.
 */
export const shellRoutes = {
  dashboard: ROUTES.dashboard,
  advisor: ROUTES.advisor,
  profile: ROUTES.profile,
} as const;

/** Ordered list for data-driven shell route matrices (N03). */
export const shellRouteList = [
  shellRoutes.dashboard,
  shellRoutes.advisor,
  shellRoutes.profile,
] as const;
