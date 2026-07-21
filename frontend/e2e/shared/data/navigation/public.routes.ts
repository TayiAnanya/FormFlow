import { ROUTES } from '../../config/constants';

/**
 * Guest-accessible public routes (`guestGuard` surfaces).
 */
export const publicRoutes = {
  landing: ROUTES.landing,
  login: ROUTES.login,
  register: ROUTES.register,
} as const;

export const publicRouteList = [
  publicRoutes.landing,
  publicRoutes.login,
  publicRoutes.register,
] as const;

/** Landing entry destinations for N01 / N02 (AUT-NAV-02). */
export const landingEntryTargets = {
  login: publicRoutes.login,
  register: publicRoutes.register,
} as const;
