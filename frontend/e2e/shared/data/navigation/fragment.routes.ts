import { ROUTES } from '../../config/constants';

/**
 * Shell fragment targets — Forms / Applications land on dashboard hashes.
 * Matches live portal `routerLink` + `fragment` (not Workspace business data).
 */
export const fragmentRoutes = {
  forms: {
    path: ROUTES.dashboard,
    hash: '#workflows',
    full: `${ROUTES.dashboard}#workflows`,
  },
  applications: {
    path: ROUTES.dashboard,
    hash: '#applications',
    full: `${ROUTES.dashboard}#applications`,
  },
} as const;

export const fragmentRouteList = [
  fragmentRoutes.forms,
  fragmentRoutes.applications,
] as const;
