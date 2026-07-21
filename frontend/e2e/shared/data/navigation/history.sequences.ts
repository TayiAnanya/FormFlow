import { ROUTES } from '../../config/constants';

/**
 * Ordered shell route sequences for browser back/forward (N11).
 * Specs navigate in order, then goBack / goForward.
 */
export const historySequences = {
  /** Dashboard → Advisor → Profile */
  shellCrossNav: [
    ROUTES.dashboard,
    ROUTES.advisor,
    ROUTES.profile,
  ],
  /** Dashboard → Advisor (smoke-friendly shorter chain) */
  dashboardAdvisor: [ROUTES.dashboard, ROUTES.advisor],
  /** Advisor → Dashboard (reverse for forward-history setup) */
  advisorThenDashboard: [ROUTES.advisor, ROUTES.dashboard],
} as const;

export type HistorySequenceName = keyof typeof historySequences;
