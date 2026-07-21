import { ROUTES } from '../../shared/config/constants';

/**
 * Safe vs unsafe returnUrl samples for guard / post-auth resolution.
 * Mirrors `resolvePostAuthUrl` allowlist behavior.
 */
export const safeReturnUrls = {
  dashboard: ROUTES.dashboard,
  advisor: ROUTES.advisor,
  profile: ROUTES.profile,
  accountOpeningForm: ROUTES.form('account-opening'),
  loanInquiryForm: ROUTES.form('loan-inquiry'),
} as const;

export const unsafeReturnUrls = {
  externalHttps: 'https://evil.example/phish',
  externalHttp: 'http://example.com',
  protocolRelative: '//evil.example/phish',
  unknownInAppPath: '/admin/secret',
  applicationsPath: '/applications/ACC-1',
} as const;

/** App fallback when returnUrl is missing or unsafe. */
export const returnUrlFallback = ROUTES.dashboard;

/**
 * Deep-link packs for loginWithReturnUrl / authGuard scenarios (S08, S11, S13).
 */
export const returnUrlScenarios = {
  guestDeepLinkDashboard: {
    protectedPath: safeReturnUrls.dashboard,
    expectedAfterLogin: safeReturnUrls.dashboard,
  },
  guestDeepLinkForm: {
    protectedPath: safeReturnUrls.accountOpeningForm,
    expectedAfterLogin: safeReturnUrls.accountOpeningForm,
  },
  guestDeepLinkAdvisor: {
    protectedPath: safeReturnUrls.advisor,
    expectedAfterLogin: safeReturnUrls.advisor,
  },
  unsafeExternal: {
    returnUrlQuery: unsafeReturnUrls.externalHttps,
    expectedAfterLogin: returnUrlFallback,
  },
  unsafeProtocolRelative: {
    returnUrlQuery: unsafeReturnUrls.protocolRelative,
    expectedAfterLogin: returnUrlFallback,
  },
  unsafeUnknownPath: {
    returnUrlQuery: unsafeReturnUrls.unknownInAppPath,
    expectedAfterLogin: returnUrlFallback,
  },
} as const;
