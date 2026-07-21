import { Injectable } from '@angular/core';

import { MappedFormValues } from '../../smart-assist/models/document-extraction.model';

/**
 * Holds one-shot prefill payloads when navigating from Smart Banking Advisor
 * into an existing schema-driven form.
 */
@Injectable({ providedIn: 'root' })
export class FormPrefillService {
  private pending: MappedFormValues | null = null;

  queuePrefill(values: MappedFormValues): void {
    this.pending = { ...values };
  }

  peekPrefill(): MappedFormValues | null {
    return this.pending ? { ...this.pending } : null;
  }

  consumePrefill(): MappedFormValues | null {
    const values = this.pending;
    this.pending = null;
    return values;
  }

  clear(): void {
    this.pending = null;
  }
}
