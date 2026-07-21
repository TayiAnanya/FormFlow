import { SCENARIO_CATALOG } from '../../demo/data/scenario-catalog';
import { PORTAL_MODULE_CATALOG } from '../../demo/data/portal-module.catalog';

/** AI capability cards for the landing “AI Features” section. */
export interface LandingAiFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Optional deep-link into an existing portal module (auth required). */
  routerLink?: readonly string[];
}

/** Step in the “How it works” journey. */
export interface LandingJourneyStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/** Differentiator for “Why Choose FormFlow”. */
export interface LandingAdvantage {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/** Metric shown in the statistics strip. */
export interface LandingStat {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export const LANDING_AI_FEATURES: readonly LandingAiFeature[] = [
  {
    id: 'smart-banking-advisor',
    title: 'Smart Banking Advisor',
    description:
      'Describe goals in plain language. Get product recommendations, a health score, and a 12-month roadmap — then apply in existing modules.',
    icon: 'pi pi-comments',
    routerLink: ['/advisor'],
  },
  {
    id: 'voice-fraud-reporting',
    title: 'Voice Fraud Reporting',
    description:
      'Speak naturally in Support Center. Live transcript, confidence signals, and AI extraction populate dispute fields for you.',
    icon: 'pi pi-microphone',
    routerLink: ['/forms', 'customer-support'],
  },
  {
    id: 'joint-account-builder',
    title: 'Joint Account Builder',
    description:
      'Add co-applicants as collapsible profiles with nested validation, document uploads, and schema-driven rules.',
    icon: 'pi pi-users',
    routerLink: ['/forms', 'joint-family-account'],
  },
];

export const LANDING_JOURNEY_STEPS: readonly LandingJourneyStep[] = [
  {
    id: 'register',
    title: 'Register',
    description: 'Create your FormFlow profile in seconds — details stay on this device for the demo.',
    icon: 'pi pi-user-plus',
  },
  {
    id: 'login',
    title: 'Login',
    description: 'Sign in securely to unlock the banking workspace and AI assistants.',
    icon: 'pi pi-sign-in',
  },
  {
    id: 'choose-service',
    title: 'Choose Banking Service',
    description: 'Open accounts, loans, cards, support, or joint applications from one dashboard.',
    icon: 'pi pi-th-large',
  },
  {
    id: 'ai-assistance',
    title: 'AI Assistance',
    description: 'Use Advisor guidance, voice fraud reporting, or document assist while you work.',
    icon: 'pi pi-sparkles',
  },
  {
    id: 'submit',
    title: 'Submit Application',
    description: 'Validate, review, and submit — schema-driven forms keep every journey consistent.',
    icon: 'pi pi-check-circle',
  },
];

export const LANDING_ADVANTAGES: readonly LandingAdvantage[] = [
  {
    id: 'ai-powered',
    title: 'AI Powered',
    description: 'Advisor insights and extraction that stay inside your banking journey.',
    icon: 'pi pi-bolt',
  },
  {
    id: 'voice-enabled',
    title: 'Voice Enabled',
    description: 'Report fraud by speaking — fields fill with confidence-aware mapping.',
    icon: 'pi pi-microphone',
  },
  {
    id: 'dynamic-forms',
    title: 'Dynamic Forms',
    description: 'Configuration-driven fields, conditions, and validation — not hardcoded screens.',
    icon: 'pi pi-sitemap',
  },
  {
    id: 'secure',
    title: 'Secure',
    description: 'Auth-gated portal routes, session-aware guards, and client-side demo isolation.',
    icon: 'pi pi-shield',
  },
  {
    id: 'responsive',
    title: 'Responsive',
    description: 'A calm banking workspace that stays precise from desktop to mobile.',
    icon: 'pi pi-mobile',
  },
];

/** Stats derived from live catalogs where possible — extend here, not in the component. */
export const LANDING_STATS: readonly LandingStat[] = [
  {
    id: 'modules',
    label: 'Banking modules',
    value: String(PORTAL_MODULE_CATALOG.length),
    hint: 'Live catalog count',
  },
  {
    id: 'form-journeys',
    label: 'Schema-driven journeys',
    value: String(SCENARIO_CATALOG.length),
    hint: 'From scenario catalog',
  },
  {
    id: 'ai-surfaces',
    label: 'AI-assisted surfaces',
    value: String(LANDING_AI_FEATURES.length),
    hint: 'Advisor, voice, joint',
  },
  {
    id: 'field-types',
    label: 'Supported field types',
    value: '6+',
    hint: 'Renderer capability',
  },
];

export interface LandingFooterLink {
  id: string;
  label: string;
  routerLink: readonly string[];
  fragment?: string;
}

export const LANDING_FOOTER_LINKS: readonly LandingFooterLink[] = [
  { id: 'login', label: 'Login', routerLink: ['/login'] },
  { id: 'register', label: 'Register', routerLink: ['/register'] },
  { id: 'services', label: 'Banking services', routerLink: ['/'], fragment: 'services' },
];
