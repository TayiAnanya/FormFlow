import { ROUTES } from '../../config/constants';
import type { ShellNavTarget } from '../../pages/portal-shell.page';
import { fragmentRoutes } from './fragment.routes';
import { shellRoutes } from './shell.routes';

/**
 * Shell menu targets aligned with PortalShellPage / navigateShellTo.
 */
export const navigationTargets = {
  dashboard: 'dashboard',
  forms: 'forms',
  applications: 'applications',
  advisor: 'advisor',
  profile: 'profile',
} as const satisfies Record<ShellNavTarget, ShellNavTarget>;

export const shellNavTargetList: readonly ShellNavTarget[] = [
  navigationTargets.dashboard,
  navigationTargets.forms,
  navigationTargets.applications,
  navigationTargets.advisor,
  navigationTargets.profile,
];

/** Targets that set `portal-nav-link-active` (exact routerLinkActive routes). */
export const activeStateTargets: readonly Exclude<
  ShellNavTarget,
  'forms' | 'applications'
>[] = [
  navigationTargets.dashboard,
  navigationTargets.advisor,
  navigationTargets.profile,
];

/**
 * Intended destinations after shell clicks — single source for workflows + specs.
 * Paths come from shared ROUTES / fragment packs.
 */
export const shellNavDestinations: Record<
  ShellNavTarget,
  { path: string; hash?: string }
> = {
  dashboard: { path: shellRoutes.dashboard },
  forms: {
    path: fragmentRoutes.forms.path,
    hash: fragmentRoutes.forms.hash,
  },
  applications: {
    path: fragmentRoutes.applications.path,
    hash: fragmentRoutes.applications.hash,
  },
  advisor: { path: shellRoutes.advisor },
  profile: { path: shellRoutes.profile },
};

/** Brand / logo home destination (N05). */
export const brandHomeDestination = ROUTES.dashboard;

/** Post-logout destination (N12). */
export const logoutDestination = ROUTES.login;
