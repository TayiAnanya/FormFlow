import { ROUTES } from '../../shared/config/constants';

/**
 * Agreed critical surfaces for Sprint 07 quality matrices.
 */
export type QualitySurfaceId =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'advisor'
  | 'form-account';

export type QualitySurface = {
  id: QualitySurfaceId;
  path: string;
  /** Requires authenticated session. */
  auth: boolean;
};

export const QUALITY_SURFACES: readonly QualitySurface[] = [
  { id: 'landing', path: ROUTES.landing, auth: false },
  { id: 'login', path: ROUTES.login, auth: false },
  { id: 'dashboard', path: ROUTES.dashboard, auth: true },
  { id: 'advisor', path: ROUTES.advisor, auth: true },
  { id: 'form-account', path: ROUTES.form('account-opening'), auth: true },
] as const;

export const UNKNOWN_FORM_PATH = ROUTES.form('does-not-exist-scenario');
export const UNKNOWN_APPLICATION_PATH = ROUTES.application('NOPE-999');

export const EMPTY_COPY = {
  applications: 'No applications submitted yet.',
  recommendations: 'No saved recommendations yet.',
} as const;
