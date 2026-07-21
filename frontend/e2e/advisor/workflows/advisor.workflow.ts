import type { Page } from '@playwright/test';

import { ROUTES, WORKSPACE_STORAGE_KEYS } from '../../shared/config/constants';
import { DashboardPage } from '../../workspace/pages';
import { BankingAdvisorPage } from '../pages';
import {
  buildGeminiEmptyResponse,
  buildGeminiResponse,
  buildGeminiVagueResponse,
  mockAdvisorData,
} from '../data/advisor.responses';
import type { AdvisorData, AdvisorMockVariant } from '../data/advisor.responses';

/** Match Gemini via Angular proxy OR direct Google host. */
const GEMINI_ROUTE_PATTERN = /generateContent|\/gemini-api\//;

// ---------------------------------------------------------------------------
// Network stubs — install before page navigation to intercept Gemini calls
// ---------------------------------------------------------------------------

/**
 * Stub a successful Gemini response with deterministic advisor data.
 * Returns the mock data for downstream assertions.
 */
export async function stubAdvisorSuccess(
  page: Page,
  variant: AdvisorMockVariant = 'loan',
): Promise<AdvisorData> {
  const data = mockAdvisorData(variant);
  await page.route(GEMINI_ROUTE_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildGeminiResponse(data)),
    });
  });
  return data;
}

/**
 * Stub a delayed successful Gemini response.
 * Useful for asserting loading state before results arrive.
 */
export async function stubAdvisorDelayed(
  page: Page,
  variant: AdvisorMockVariant = 'loan',
  delayMs = 800,
): Promise<AdvisorData> {
  const data = mockAdvisorData(variant);
  await page.route(GEMINI_ROUTE_PATTERN, async (route) => {
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildGeminiResponse(data)),
    });
  });
  return data;
}

/**
 * Stub a Gemini response that parseBankingAdvisorAdvice rejects (vague goals).
 * Produces the error phase.
 */
export async function stubAdvisorVague(page: Page): Promise<void> {
  await page.route(GEMINI_ROUTE_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildGeminiVagueResponse()),
    });
  });
}

/**
 * Stub an HTTP error from Gemini (e.g. 500).
 * Produces the error phase.
 */
export async function stubAdvisorHttpError(page: Page, status = 500): Promise<void> {
  await page.route(GEMINI_ROUTE_PATTERN, async (route) => {
    await route.fulfill({ status });
  });
}

/**
 * Stub an empty candidates response (no text content).
 * Produces the error phase.
 */
export async function stubAdvisorEmptyResponse(page: Page): Promise<void> {
  await page.route(GEMINI_ROUTE_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildGeminiEmptyResponse()),
    });
  });
}

/**
 * Stub with custom advisor data (for health score tone tests etc.).
 */
export async function stubAdvisorWithData(page: Page, data: AdvisorData): Promise<void> {
  await page.route(GEMINI_ROUTE_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildGeminiResponse(data)),
    });
  });
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/** Open advisor directly via /advisor URL. */
export async function openAdvisor(page: Page): Promise<BankingAdvisorPage> {
  const advisor = new BankingAdvisorPage(page);
  await advisor.open();
  return advisor;
}

/** Open advisor via the shell navigation "Advisor" link. */
export async function openAdvisorViaNav(page: Page): Promise<BankingAdvisorPage> {
  await page.goto(ROUTES.dashboard);
  await page.getByRole('link', { name: /^Advisor$/i }).click();
  const advisor = new BankingAdvisorPage(page);
  await advisor.expectReady();
  return advisor;
}

/** Open advisor via the dashboard promo card "Open Advisor" button. */
export async function openAdvisorViaPromo(page: Page): Promise<BankingAdvisorPage> {
  const dashboard = new DashboardPage(page);
  await dashboard.open();
  await dashboard.openAdvisor();
  const advisor = new BankingAdvisorPage(page);
  await advisor.expectReady();
  return advisor;
}

// ---------------------------------------------------------------------------
// Interaction helpers
// ---------------------------------------------------------------------------

/** Fill message and submit — assertions are the caller's responsibility. */
export async function fillAndSubmit(
  advisor: BankingAdvisorPage,
  goal: string,
): Promise<void> {
  await advisor.fillMessage(goal);
  await advisor.submitMessage();
}

/** Fill, submit, and await results (stub must be installed before calling openAdvisor). */
export async function submitGoalAndAwaitResults(
  advisor: BankingAdvisorPage,
  goal: string,
): Promise<void> {
  await fillAndSubmit(advisor, goal);
  await advisor.waitForResults();
}

/** Fill, submit, and await error phase (error stub must be installed). */
export async function submitGoalAndAwaitError(
  advisor: BankingAdvisorPage,
  goal: string,
): Promise<void> {
  await fillAndSubmit(advisor, goal);
  await advisor.waitForError();
}

/**
 * Full happy flow: install stub → open advisor → fill → submit → await results.
 * Returns the BankingAdvisorPage and the mocked data for assertions.
 */
export async function completeAdvisorFlow(
  page: Page,
  variant: AdvisorMockVariant = 'loan',
  goal = 'I want to buy a car.',
): Promise<{ advisor: BankingAdvisorPage; data: AdvisorData }> {
  const data = await stubAdvisorSuccess(page, variant);
  const advisor = await openAdvisor(page);
  await submitGoalAndAwaitResults(advisor, goal);
  return { advisor, data };
}

/**
 * Full error flow: install error stub → open advisor → fill → submit → await error.
 */
export async function completeAdvisorErrorFlow(
  page: Page,
  goal = 'I need financial help.',
  stubType: 'vague' | 'http' | 'empty' = 'vague',
): Promise<BankingAdvisorPage> {
  switch (stubType) {
    case 'vague':
      await stubAdvisorVague(page);
      break;
    case 'http':
      await stubAdvisorHttpError(page);
      break;
    case 'empty':
      await stubAdvisorEmptyResponse(page);
      break;
  }
  const advisor = await openAdvisor(page);
  await submitGoalAndAwaitError(advisor, goal);
  return advisor;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/** Read ff_advisor_recommendations from localStorage. */
export async function readSavedRecommendations(page: Page): Promise<unknown[]> {
  const raw = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    WORKSPACE_STORAGE_KEYS.advisorRecommendations,
  );
  if (!raw) return [];
  try {
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}
