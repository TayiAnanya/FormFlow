import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSchema } from '../../../models/form-schema.model';
import { SchemaLoaderService } from '../../../services/schema-loader.service';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';
import { provideRouter } from '@angular/router';

import { DynamicFormRenderer } from './dynamic-form-renderer';
import { SmartAssistPanel } from '../../smart-assist/components/smart-assist-panel/smart-assist-panel';

type RendererHarness = DynamicFormRenderer & {
  form: DynamicFormRenderer['form'];
  patchFormValues: DynamicFormRenderer['patchFormValues'];
};

function asHarness(component: DynamicFormRenderer): RendererHarness {
  return component as RendererHarness;
}

describe('DynamicFormRenderer smart assist integration', () => {
  let fixture: ComponentFixture<DynamicFormRenderer>;
  let harness: RendererHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormRenderer, SmartAssistPanel],
      providers: [SchemaLoaderService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormRenderer);
    fixture.componentRef.setInput('schema', ACCOUNT_OPENING_SCHEMA);
    fixture.detectChanges();
    harness = asHarness(fixture.componentInstance);
  });

  it('should allow editing extracted values', () => {
    harness.patchFormValues({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
    });

    fixture.detectChanges();

    const fullNameInput = fixture.nativeElement.querySelector('#fullName') as HTMLInputElement;
    expect(fullNameInput.value).toBe('Ananya Tayi');
    expect(fullNameInput.readOnly).toBeFalse();

    fullNameInput.value = 'Edited Name';
    fullNameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(harness.form.get('fullName')?.value).toBe('Edited Name');
  });

  it('should preserve readonly fields when patching', () => {
    const readonlyFixture = TestBed.createComponent(DynamicFormRenderer);
    const schema: FormSchema = {
      ...ACCOUNT_OPENING_SCHEMA,
      id: 'account-opening-readonly-test',
      fields: [
        ...ACCOUNT_OPENING_SCHEMA.fields,
        {
          key: 'customerId',
          type: 'text',
          label: 'Customer ID',
          readonly: true,
          defaultValue: 'CUS-00045821',
        },
      ],
    };

    readonlyFixture.componentRef.setInput('schema', schema);
    readonlyFixture.detectChanges();
    const readonlyHarness = asHarness(readonlyFixture.componentInstance);

    const result = readonlyHarness.patchFormValues({
      customerId: 'CUS-99999999',
      fullName: 'Ananya Tayi',
    });

    expect(result.patched['customerId']).toBeUndefined();
    expect(readonlyHarness.form.get('customerId')?.value).toBe('CUS-00045821');
    expect(result.patched['fullName']).toBe('Ananya Tayi');
  });

  it('should not overwrite user-entered values unless confirmed', () => {
    harness.form.get('fullName')?.setValue('Existing Name');

    const withoutOverwrite = harness.patchFormValues({ fullName: 'Ananya Tayi', email: 'ananya@example.com' });
    expect(withoutOverwrite.patched['fullName']).toBeUndefined();
    expect(harness.form.get('fullName')?.value).toBe('Existing Name');

    const withOverwrite = harness.patchFormValues(
      { fullName: 'Ananya Tayi' },
      { overwriteExisting: true },
    );
    expect(withOverwrite.patched['fullName']).toBe('Ananya Tayi');
    expect(harness.form.get('fullName')?.value).toBe('Ananya Tayi');
  });
});
