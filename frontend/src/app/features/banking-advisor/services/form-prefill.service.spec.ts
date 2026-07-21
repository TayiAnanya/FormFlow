import { TestBed } from '@angular/core/testing';

import { FormPrefillService } from './form-prefill.service';

describe('FormPrefillService', () => {
  let service: FormPrefillService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FormPrefillService] });
    service = TestBed.inject(FormPrefillService);
  });

  it('queues and consumes prefill values once', () => {
    service.queuePrefill({ loanType: 'auto', loanAmount: '500000' });
    expect(service.peekPrefill()?.['loanType']).toBe('auto');

    const consumed = service.consumePrefill();
    expect(consumed?.['loanType']).toBe('auto');
    expect(service.consumePrefill()).toBeNull();
  });
});
