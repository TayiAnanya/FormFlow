import { FormScenario } from '../../../models/form-scenario.model';

/** Demo-layer presentation metadata for dashboard scenario cards. */
export interface ScenarioCatalogEntry extends FormScenario {
  icon: string;
  features: string[];
  category?: string;
  accent?: 'support';
}

export const SCENARIO_CATALOG: ScenarioCatalogEntry[] = [
  {
    id: 'account-opening',
    title: 'Account Opening',
    description: 'Apply for a new savings or current account.',
    icon: 'pi pi-user',
    features: ['Dynamic Renderer', 'Reactive Forms', 'Schema Driven'],
  },
  {
    id: 'loan-inquiry',
    title: 'Loan Inquiry',
    description: 'Submit a personal loan inquiry quickly.',
    icon: 'pi pi-wallet',
    features: ['Dynamic Renderer', 'Reactive Forms', 'Schema Driven'],
  },
  {
    id: 'smart-credit-card',
    title: 'Platinum Card',
    description: 'Apply for our premium credit card with smart validation.',
    icon: 'pi pi-credit-card',
    features: [
      'Conditional Sections',
      'Smart Form Behaviour',
      'Dynamic Validation',
      'Schema Driven',
    ],
  },
  {
    id: 'customer-support',
    title: 'Support Center',
    description:
      'Raise disputes, report fraud with voice assist, and request support services.',
    icon: 'pi pi-headphones',
    features: [
      'Raise Disputes',
      'Report Fraud (Voice)',
      'Block Lost Cards',
      'ATM & UPI Issues',
    ],
  },
  {
    id: 'joint-family-account',
    title: 'Joint / Family Account Builder',
    description: 'Create a joint savings account with dynamically added applicants.',
    icon: 'pi pi-users',
    features: [
      'Repeater Fields',
      'Nested Validation',
      'Conditional Applicants',
      'Schema Driven',
    ],
  },
];

export function getScenarioById(id: string): ScenarioCatalogEntry | undefined {
  return SCENARIO_CATALOG.find((scenario) => scenario.id === id);
}
