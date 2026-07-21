import type { Page } from '@playwright/test';

/**
 * Data setup seam — specs/fixtures depend on this interface, not raw storage APIs.
 * V1: LocalStorageDataSetupAdapter. V2 (future): API adapter.
 */
export interface SeedUserInput {
  id?: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  registeredAt?: string;
}

export interface DataSetupAdapter {
  /** Clears auth + workspace keys for an isolated guest context. */
  reset(page: Page): Promise<void>;

  /** Ensures a user exists in `bank_users` (does not log in). */
  seedUser(page: Page, user: SeedUserInput): Promise<void>;

  /**
   * Establishes a logged-in session via storage (Sprint 01+).
   * Not used by Sprint 00 harness tests.
   */
  loginAs(page: Page, user: SeedUserInput): Promise<void>;

  /** Replaces `ff_applications` JSON array. */
  seedApplications(page: Page, applicationsJson: string): Promise<void>;

  /** Replaces `ff_form_drafts` JSON array. */
  seedDraft(page: Page, draftJson: string): Promise<void>;

  /** Replaces `ff_advisor_recommendations` JSON array. */
  seedAdvisorRecommendation(page: Page, recommendationJson: string): Promise<void>;

  /** Replaces `ff_customer_profiles` JSON array (Sprint 03). */
  seedProfiles(page: Page, profilesJson: string): Promise<void>;

  /** Replaces `ff_activity_timeline` JSON array (Sprint 03). */
  seedActivities(page: Page, activitiesJson: string): Promise<void>;

  /** Replaces `ff_application_counters` JSON object (Sprint 03). */
  seedApplicationCounters(page: Page, countersJson: string): Promise<void>;
}
