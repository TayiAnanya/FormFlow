import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SchemaLoaderService } from '../../../services/schema-loader.service';
import { LOAN_INQUIRY_SCHEMA } from '../../../schemas/bundled/loan-inquiry.schema';
import { DynamicFormRenderer } from '../../renderer/dynamic-form-renderer/dynamic-form-renderer';
import { FormPrefillService } from '../../banking-advisor/services/form-prefill.service';
import { FormHost } from './form-host';

describe('FormHost advisor prefill integration', () => {
  let prefill: FormPrefillService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHost, DynamicFormRenderer],
      providers: [
        provideRouter([
          { path: 'forms/:scenarioId', component: FormHost },
        ]),
        SchemaLoaderService,
        FormPrefillService,
      ],
    }).compileComponents();

    prefill = TestBed.inject(FormPrefillService);
  });

  it('Existing forms receive pre-filled values from FormPrefillService', () => {
    prefill.queuePrefill({
      loanType: 'auto',
      loanAmount: '800000',
      purpose: 'Buy a Car',
    });

    const rendererFixture = TestBed.createComponent(DynamicFormRenderer);
    rendererFixture.componentRef.setInput('schema', LOAN_INQUIRY_SCHEMA);
    rendererFixture.detectChanges();

    const renderer = rendererFixture.componentInstance as unknown as {
      form: { get: (key: string) => { value: unknown } | null };
      patchFormValues: (
        values: Record<string, unknown>,
        options?: { overwriteExisting?: boolean },
      ) => void;
    };

    const values = prefill.consumePrefill();
    expect(values).not.toBeNull();
    renderer.patchFormValues(values!, { overwriteExisting: true });
    rendererFixture.detectChanges();

    expect(renderer.form.get('loanType')?.value).toBe('auto');
    expect(renderer.form.get('loanAmount')?.value).toBe('800000');
    expect(renderer.form.get('purpose')?.value).toBe('Buy a Car');
  });
});
