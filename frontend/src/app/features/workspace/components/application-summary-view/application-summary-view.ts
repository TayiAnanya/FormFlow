import { JsonPipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

import { Field } from '../../../../models/field.model';
import { FormSchema } from '../../../../models/form-schema.model';

interface SummaryRow {
  key: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-application-summary-view',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="summary-view">
      @for (row of rows; track row.key) {
        <div class="summary-row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      }
      @if (rows.length === 0) {
        <pre class="summary-fallback">{{ values | json }}</pre>
      }
    </div>
  `,
  styles: `
    .summary-view {
      display: grid;
      gap: 0.85rem;
    }
    .summary-row {
      display: grid;
      gap: 0.25rem;
      padding: 0.85rem 1rem;
      border-radius: 0.9rem;
      background: rgba(15, 118, 110, 0.05);
      border: 1px solid rgba(15, 118, 110, 0.1);
    }
    .summary-row dt {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(15, 28, 26, 0.5);
    }
    .summary-row dd {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f1c1a;
      white-space: pre-wrap;
    }
    .summary-fallback {
      margin: 0;
      padding: 1rem;
      border-radius: 0.9rem;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 0.8rem;
      overflow: auto;
    }
  `,
})
export class ApplicationSummaryView implements OnChanges {
  @Input({ required: true }) schema!: FormSchema;
  @Input({ required: true }) values: Record<string, unknown> = {};

  protected rows: SummaryRow[] = [];

  ngOnChanges(): void {
    this.rows = this.flattenFields(this.schema?.fields ?? [], this.values, '');
  }

  private flattenFields(
    fields: Field[],
    values: Record<string, unknown>,
    prefix: string,
  ): SummaryRow[] {
    const rows: SummaryRow[] = [];

    for (const field of fields) {
      const key = prefix ? `${prefix}.${field.key}` : field.key;
      const raw = values[field.key];

      if (field.type === 'repeater' && Array.isArray(raw)) {
        raw.forEach((row, index) => {
          if (row && typeof row === 'object') {
            rows.push(
              ...this.flattenFields(
                field.fields ?? [],
                row as Record<string, unknown>,
                `${key}[${index}]`,
              ),
            );
          }
        });
        continue;
      }

      if (raw === undefined || raw === null || raw === '') {
        continue;
      }

      rows.push({
        key,
        label: field.label || field.key,
        value: this.formatValue(raw),
      });
    }

    return rows;
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.formatValue(item)).join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}
