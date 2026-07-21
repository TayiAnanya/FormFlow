/**
 * Route, storage-key, and scenario constants mirroring the FormFlow app.
 * Keep in sync with app.routes.ts, AUTH_STORAGE_KEYS, WORKSPACE_STORAGE_KEYS.
 */
export const ROUTES = {
  landing: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  advisor: '/advisor',
  profile: '/profile',
  form: (scenarioId: string) => `/forms/${scenarioId}`,
  application: (applicationId: string) => `/applications/${applicationId}`,
} as const;

/** Safe returnUrl allowlist prefixes used by the app. */
export const SAFE_RETURN_URL_PREFIXES = [
  '/dashboard',
  '/advisor',
  '/profile',
  '/forms/',
] as const;

export const AUTH_STORAGE_KEYS = {
  users: 'bank_users',
  currentUser: 'current_user',
  isLoggedIn: 'is_logged_in',
} as const;

export const WORKSPACE_STORAGE_KEYS = {
  profiles: 'ff_customer_profiles',
  applications: 'ff_applications',
  drafts: 'ff_form_drafts',
  activities: 'ff_activity_timeline',
  advisorRecommendations: 'ff_advisor_recommendations',
  applicationCounters: 'ff_application_counters',
} as const;

export const SCENARIO_IDS = [
  'account-opening',
  'loan-inquiry',
  'smart-credit-card',
  'customer-support',
  'joint-family-account',
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export const APPLICATION_ID_PREFIX: Readonly<Record<ScenarioId, string>> = {
  'account-opening': 'ACC',
  'loan-inquiry': 'LOAN',
  'smart-credit-card': 'CARD',
  'customer-support': 'SUP',
  'joint-family-account': 'JOINT',
};
