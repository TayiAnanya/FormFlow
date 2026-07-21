import { SCENARIO_CATALOG } from './scenario-catalog';

/**
 * Presentation model for public landing (and any surface that lists banking modules).
 * Routes match existing app.routes — do not invent parallel navigation targets.
 */
export interface PortalModuleCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Router commands for an existing authenticated portal route. */
  routerLink: readonly string[];
}

/** Extra portal experiences that are not form scenarios (e.g. Advisor). */
const ADDITIONAL_PORTAL_MODULES: readonly PortalModuleCard[] = [
  {
    id: 'smart-banking-advisor',
    title: 'Smart Banking Advisor',
    description:
      'Describe your goals in natural language and get personalized product guidance.',
    icon: 'pi pi-comments',
    routerLink: ['/advisor'],
  },
];

/**
 * Landing / marketing service cards.
 * Form modules are derived from {@link SCENARIO_CATALOG}; add form scenarios there.
 * Non-form modules belong in {@link ADDITIONAL_PORTAL_MODULES}.
 */
export const PORTAL_MODULE_CATALOG: readonly PortalModuleCard[] = [
  ...SCENARIO_CATALOG.map(
    (scenario): PortalModuleCard => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description ?? '',
      icon: scenario.icon,
      routerLink: ['/forms', scenario.id],
    }),
  ),
  ...ADDITIONAL_PORTAL_MODULES,
];
