import { ROUTES } from '../../config/constants';

/**
 * Routes that require authentication (`authGuard`).
 * Guest access must redirect to `/login?returnUrl=…`.
 */
export const protectedRoutes = {
  dashboard: ROUTES.dashboard,
  advisor: ROUTES.advisor,
  profile: ROUTES.profile,
  accountOpeningForm: ROUTES.form('account-opening'),
  loanInquiryForm: ROUTES.form('loan-inquiry'),
} as const;

/** Representative protected paths for guest direct-URL / guard samples (N07). */
export const protectedRouteList = [
  protectedRoutes.dashboard,
  protectedRoutes.advisor,
  protectedRoutes.profile,
  protectedRoutes.accountOpeningForm,
] as const;
