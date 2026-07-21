/** Workspace domain models — persistence-agnostic for future REST migration. */

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Resolved';

export interface CustomerProfile {
  userId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  /** Banking customer identifier shown on forms (e.g. CUST-1001). */
  customerId: string;
  updatedAt: string;
}

export interface BankingApplication {
  id: string;
  userId: string;
  formType: string;
  formTitle: string;
  status: ApplicationStatus;
  submittedAt: string;
  summary: string;
  values: Record<string, unknown>;
}

export interface FormDraft {
  userId: string;
  formType: string;
  formTitle: string;
  values: Record<string, unknown>;
  updatedAt: string;
}

export type ActivityType =
  | 'registered'
  | 'application_submitted'
  | 'draft_started'
  | 'advisor_plan'
  | 'status_updated';

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  relatedId?: string;
  formType?: string;
}

export interface StoredAdvisorRecommendation {
  userId: string;
  sourceMessage: string;
  summary: string;
  productCards: readonly {
    id: string;
    title: string;
    categoryLabel: string;
    reason: string;
    targetScenarioId: string;
    ctaLabel: string;
    icon: string;
    prefill: Record<string, unknown>;
  }[];
  createdAt: string;
}

export interface ApplicationStatistics {
  submitted: number;
  approved: number;
  pending: number;
  drafts: number;
  resolvedSupport: number;
}

export const WORKSPACE_STORAGE_KEYS = {
  profiles: 'ff_customer_profiles',
  applications: 'ff_applications',
  drafts: 'ff_form_drafts',
  activities: 'ff_activity_timeline',
  advisorRecommendations: 'ff_advisor_recommendations',
  applicationCounters: 'ff_application_counters',
} as const;

/** Maps scenario ids to application ID prefixes. */
export const APPLICATION_ID_PREFIX: Readonly<Record<string, string>> = {
  'account-opening': 'ACC',
  'loan-inquiry': 'LOAN',
  'smart-credit-card': 'CARD',
  'customer-support': 'SUP',
  'joint-family-account': 'JOINT',
};
