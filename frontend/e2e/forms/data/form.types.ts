import type { ScenarioId } from '../../shared/config/constants';

export type FormFillStep =
  | { key: string; type: 'text'; value: string }
  | { key: string; type: 'textarea'; value: string }
  | { key: string; type: 'date'; value: string }
  | { key: string; type: 'dropdown'; value: string; label: string }
  | { key: string; type: 'multiselect'; values: string[]; labels: string[] }
  | { key: string; type: 'checkbox'; value: boolean };

export type ScenarioHappyPack = {
  scenarioId: ScenarioId;
  title: string;
  submitLabel: string;
  applicationPrefix: string;
  steps: FormFillStep[];
};

export type ValidationRow = {
  id: string;
  scenarioId: ScenarioId;
  description: string;
  /** Partial fill before asserting (may be empty). */
  setupSteps: FormFillStep[];
  /** Field expected to show the error after submit (or touch). */
  errorField: string;
  expectedMessage: string;
  submitLabel: string;
};

export type FieldTypeRow = {
  id: string;
  scenarioId: ScenarioId;
  description: string;
  setupSteps: FormFillStep[];
  assertKey: string;
  assertKind: 'visible' | 'hidden' | 'readonly' | 'value';
  expectedValue?: string;
};

export type ConditionalRow = {
  id: string;
  scenarioId: ScenarioId;
  description: string;
  setupSteps: FormFillStep[];
  visibleKeys: string[];
  hiddenKeys: string[];
};
