import {
  APPLICATION_ID_PREFIX,
  SCENARIO_IDS,
  type ScenarioId,
} from '../../shared/config/constants';
import type { SeedUserInput } from '../../shared/adapters/data-setup.adapter';
import { uniqueEmail, uniqueMobile } from '../../shared/utils/random.helper';
import { DEFAULT_AUTH_PASSWORD } from '../../authentication/workflows/auth.workflow';

export const EMPTY_COPY = {
  applications: 'No applications submitted yet.',
  drafts: 'No drafts in progress.',
  activity: 'Activity will appear as you use banking services.',
  recommendations: 'No saved recommendations yet.',
  applicationNotFound: 'Application not found for your account.',
} as const;

export const CATALOG_TITLES: Record<ScenarioId, string> = {
  'account-opening': 'Account Opening',
  'loan-inquiry': 'Loan Inquiry',
  'smart-credit-card': 'Platinum Card',
  'customer-support': 'Support Center',
  'joint-family-account': 'Joint / Family Account Builder',
};

export type WorkspaceProfile = {
  userId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  customerId: string;
  updatedAt: string;
};

export type WorkspaceApplication = {
  id: string;
  userId: string;
  formType: string;
  formTitle: string;
  status: string;
  submittedAt: string;
  summary: string;
  values: Record<string, unknown>;
};

export type WorkspaceDraft = {
  userId: string;
  formType: string;
  formTitle: string;
  values: Record<string, unknown>;
  updatedAt: string;
};

export type WorkspaceActivity = {
  id: string;
  userId: string;
  type: string;
  message: string;
  createdAt: string;
  relatedId?: string;
  formType?: string;
};

export type WorkspaceRecommendation = {
  userId: string;
  sourceMessage: string;
  summary: string;
  productCards: Array<{
    id: string;
    title: string;
    categoryLabel: string;
    reason: string;
    targetScenarioId: string;
    ctaLabel: string;
    icon: string;
    prefill: Record<string, unknown>;
  }>;
  createdAt: string;
};

export function buildAuthUser(
  overrides: Partial<SeedUserInput> = {},
): Required<SeedUserInput> {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 1_000_000);
  return {
    id: overrides.id ?? `ws-user-${stamp}-${rand}`,
    fullName: overrides.fullName ?? 'Workspace Test User',
    email: overrides.email ?? uniqueEmail('ws'),
    mobileNumber: overrides.mobileNumber ?? uniqueMobile(),
    password: overrides.password ?? DEFAULT_AUTH_PASSWORD,
    registeredAt: overrides.registeredAt ?? new Date().toISOString(),
  };
}

export function buildProfile(user: Required<SeedUserInput>): WorkspaceProfile {
  return {
    userId: user.id,
    fullName: user.fullName,
    email: user.email.toLowerCase(),
    mobileNumber: user.mobileNumber,
    customerId: `CUST-${user.id.slice(-6).toUpperCase()}`,
    updatedAt: new Date().toISOString(),
  };
}

export function buildApplication(
  userId: string,
  formType: ScenarioId,
  status: string,
  seq = 1,
): WorkspaceApplication {
  const prefix = APPLICATION_ID_PREFIX[formType];
  return {
    id: `${prefix}-${String(seq).padStart(3, '0')}`,
    userId,
    formType,
    formTitle: CATALOG_TITLES[formType],
    status,
    submittedAt: new Date().toISOString(),
    summary: `${CATALOG_TITLES[formType]} — ${status}`,
    values: { applicantName: 'Workspace Test User' },
  };
}

export function buildDraft(
  userId: string,
  formType: ScenarioId,
): WorkspaceDraft {
  return {
    userId,
    formType,
    formTitle: CATALOG_TITLES[formType],
    values: { note: 'seeded-draft' },
    updatedAt: new Date().toISOString(),
  };
}

export function buildActivity(
  userId: string,
  message: string,
  type = 'application_submitted',
  index = 0,
): WorkspaceActivity {
  return {
    id: `act-${userId}-${index}`,
    userId,
    type,
    message,
    createdAt: new Date(Date.now() - index * 60_000).toISOString(),
  };
}

export function buildRecommendation(
  userId: string,
  targets: ScenarioId[] = ['account-opening', 'loan-inquiry'],
): WorkspaceRecommendation {
  return {
    userId,
    sourceMessage: 'I want to grow savings and borrow for a car.',
    summary: 'Recommended products based on your goals.',
    productCards: targets.map((targetScenarioId, i) => ({
      id: `rec-${targetScenarioId}`,
      title: CATALOG_TITLES[targetScenarioId],
      categoryLabel: 'Suggested',
      reason: `Fits goal path ${i + 1}`,
      targetScenarioId,
      ctaLabel: 'Continue',
      icon: 'pi pi-star',
      prefill: { source: 'advisor-seed' },
    })),
    createdAt: new Date().toISOString(),
  };
}

/** Returning user pack — apps, drafts, activity, recommendation. */
export function buildReturningPack(user = buildAuthUser()) {
  const profile = buildProfile(user);
  const applications = [
    buildApplication(user.id, 'account-opening', 'Submitted', 1),
    buildApplication(user.id, 'loan-inquiry', 'Approved', 1),
    buildApplication(user.id, 'smart-credit-card', 'Under Review', 1),
    buildApplication(user.id, 'customer-support', 'Resolved', 1),
  ];
  const drafts = [
    buildDraft(user.id, 'joint-family-account'),
    buildDraft(user.id, 'account-opening'),
  ];
  const activities = [
    buildActivity(user.id, 'Submitted Account Opening', 'application_submitted', 0),
    buildActivity(user.id, 'Started Joint Family Account', 'draft_started', 1),
    buildActivity(user.id, 'Advisor plan saved', 'advisor_plan', 2),
    buildActivity(user.id, 'Registered', 'registered', 3),
  ];
  const recommendation = buildRecommendation(user.id);
  const expectedStats = {
    submitted: 4,
    approved: 1,
    pending: 2, // Submitted + Under Review
    drafts: 2,
    resolvedSupport: 1,
  };
  return {
    user,
    profile,
    applications,
    drafts,
    activities,
    recommendation,
    expectedStats,
  };
}

export const catalogScenarioIds = [...SCENARIO_IDS];

export const applicationStatusSamples = [
  'Submitted',
  'Approved',
  'Under Review',
  'Rejected',
  'Resolved',
] as const;
