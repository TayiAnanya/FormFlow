import {
  AfterViewChecked,
  Component,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, map } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';

import { FormPrefillService } from '../../banking-advisor/services/form-prefill.service';
import { ApplicationService } from '../../workspace/services/application.service';
import { DraftService } from '../../workspace/services/draft.service';
import { ProfileService } from '../../workspace/services/profile.service';
import { getScenarioById } from '../data/scenario-catalog';
import { DynamicFormRenderer } from '../../renderer/dynamic-form-renderer/dynamic-form-renderer';
import { SmartAssistPanel } from '../../smart-assist/components/smart-assist-panel/smart-assist-panel';
import { SmartAssistPatchRequest } from '../../smart-assist/models/document-extraction.model';
import { VoiceAssistPanel } from '../../voice-assist/components/voice-assist-panel/voice-assist-panel';
import { FormSchema } from '../../../models/form-schema.model';
import { Submission } from '../../../models/submission.model';
import { SchemaLoaderService } from '../../../services/schema-loader.service';

@Component({
  selector: 'app-form-host',
  standalone: true,
  imports: [RouterLink, Button, Card, Message, DynamicFormRenderer, SmartAssistPanel, VoiceAssistPanel],
  templateUrl: './form-host.html',
  styleUrl: './form-host.css',
})
export class FormHost implements AfterViewChecked, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly schemaLoader = inject(SchemaLoaderService);
  private readonly formPrefill = inject(FormPrefillService);
  private readonly profile = inject(ProfileService);
  private readonly drafts = inject(DraftService);
  private readonly applications = inject(ApplicationService);

  private prefillAppliedForScenario: string | null = null;
  private draftHydratedForScenario: string | null = null;
  private suppressDraftSave = false;
  private readonly draftSave$ = new Subject<Record<string, unknown>>();
  private draftSub?: Subscription;

  protected readonly scenarioId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('scenarioId') ?? '')),
    { initialValue: '' },
  );

  protected readonly scenario = toSignal(
    this.route.paramMap.pipe(map((params) => getScenarioById(params.get('scenarioId') ?? ''))),
    { initialValue: undefined },
  );

  protected readonly schemaLoadResult = toSignal(
    this.route.paramMap.pipe(
      map((params) => this.schemaLoader.loadById(params.get('scenarioId') ?? '')),
    ),
    { initialValue: { status: 'not-found' as const, message: 'No form schema identifier was provided.' } },
  );

  protected lastSavedApplicationId: string | null = null;

  @ViewChild('formRenderer') private formRenderer?: DynamicFormRenderer;

  constructor() {
    this.profile.syncFromAuth();
    this.draftSub = this.draftSave$.pipe(debounceTime(600)).subscribe((values) => {
      this.persistDraft(values);
    });
  }

  ngAfterViewChecked(): void {
    const scenarioId = this.scenarioId();
    if (!this.formRenderer || !scenarioId) {
      return;
    }

    if (this.prefillAppliedForScenario !== scenarioId) {
      this.applyInitialPrefill(scenarioId);
    }

    if (this.draftHydratedForScenario !== scenarioId) {
      this.restoreDraftIfPresent(scenarioId);
    }
  }

  ngOnDestroy(): void {
    this.draftSub?.unsubscribe();
  }

  protected submitLabel(schema: FormSchema): string {
    return this.schemaLoader.resolveSubmitLabel(schema);
  }

  protected currentFormValues(): Record<string, unknown> {
    return this.formRenderer?.getFormValues() ?? {};
  }

  protected onSmartAssistPatch(request: SmartAssistPatchRequest): void {
    this.formRenderer?.patchFormValues(request.values, {
      overwriteExisting: request.overwriteExisting,
    });
  }

  /** Voice assist reuses the same renderer patch seam as Smart Document Assist. */
  protected onVoiceAssistPatch(request: SmartAssistPatchRequest): void {
    this.onSmartAssistPatch(request);
  }

  protected isSupportCenter(): boolean {
    return this.scenarioId() === 'customer-support';
  }

  protected onFormValuesChanged(values: Record<string, unknown>): void {
    if (this.suppressDraftSave || this.lastSavedApplicationId) {
      return;
    }
    this.draftSave$.next(values);
  }

  protected onFormSubmitted(submission: Submission): void {
    const scenario = this.scenario();
    const scenarioId = this.scenarioId();
    if (!scenario || !scenarioId) {
      return;
    }

    const application = this.applications.submit({
      formType: scenarioId,
      formTitle: scenario.title,
      values: submission as Record<string, unknown>,
    });
    this.lastSavedApplicationId = application.id;
  }

  private applyInitialPrefill(scenarioId: string): void {
    this.prefillAppliedForScenario = scenarioId;
    this.suppressDraftSave = true;

    const profileValues = this.profile.getPrefillValues();
    if (Object.keys(profileValues).length > 0) {
      this.formRenderer?.patchFormValues(profileValues, { overwriteExisting: false });
    }

    if (this.formPrefill.peekPrefill()) {
      const advisorValues = this.formPrefill.consumePrefill();
      if (advisorValues && Object.keys(advisorValues).length > 0) {
        this.formRenderer?.patchFormValues(advisorValues, { overwriteExisting: true });
      }
    }

    queueMicrotask(() => {
      this.suppressDraftSave = false;
    });
  }

  private restoreDraftIfPresent(scenarioId: string): void {
    this.draftHydratedForScenario = scenarioId;
    const profile = this.profile.getCurrentProfile();
    if (!profile) {
      return;
    }

    const draft = this.drafts.getDraft(profile.userId, scenarioId);
    if (!draft || Object.keys(draft.values).length === 0) {
      return;
    }

    this.suppressDraftSave = true;
    this.formRenderer?.patchFormValues(draft.values, { overwriteExisting: true });
    queueMicrotask(() => {
      this.suppressDraftSave = false;
    });
  }

  private persistDraft(values: Record<string, unknown>): void {
    const scenario = this.scenario();
    const scenarioId = this.scenarioId();
    const profile = this.profile.getCurrentProfile();
    if (!scenario || !scenarioId || !profile) {
      return;
    }

    if (!this.hasMeaningfulDraftContent(values)) {
      return;
    }

    this.drafts.saveDraft({
      userId: profile.userId,
      formType: scenarioId,
      formTitle: scenario.title,
      values,
    });
  }

  private hasMeaningfulDraftContent(values: Record<string, unknown>): boolean {
    return Object.values(values).some((value) => {
      if (value === null || value === undefined || value === false || value === '') {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object') {
        return Object.keys(value as object).length > 0;
      }
      return true;
    });
  }
}
