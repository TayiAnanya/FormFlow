import { Component, ViewChild, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';

import { getScenarioById } from '../data/scenario-catalog';
import { DynamicFormRenderer } from '../../renderer/dynamic-form-renderer/dynamic-form-renderer';
import { SmartAssistPanel } from '../../smart-assist/components/smart-assist-panel/smart-assist-panel';
import { SmartAssistPatchRequest } from '../../smart-assist/models/document-extraction.model';
import { FormSchema } from '../../../models/form-schema.model';
import { SchemaLoaderService } from '../../../services/schema-loader.service';

@Component({
  selector: 'app-form-host',
  standalone: true,
  imports: [RouterLink, Button, Card, Message, DynamicFormRenderer, SmartAssistPanel],
  templateUrl: './form-host.html',
  styleUrl: './form-host.css',
})
export class FormHost {
  private readonly route = inject(ActivatedRoute);
  private readonly schemaLoader = inject(SchemaLoaderService);

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

  @ViewChild('formRenderer') private formRenderer?: DynamicFormRenderer;

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
}
