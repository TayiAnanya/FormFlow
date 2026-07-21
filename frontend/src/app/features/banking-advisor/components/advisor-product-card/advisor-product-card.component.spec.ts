import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AdvisorProductCard } from '../../models/banking-advisor.model';
import { AdvisorProductCardComponent } from './advisor-product-card.component';

describe('AdvisorProductCardComponent', () => {
  let fixture: ComponentFixture<AdvisorProductCardComponent>;

  const product: AdvisorProductCard = {
    id: 'car-loan',
    title: 'Car Loan',
    icon: 'pi pi-car',
    categoryLabel: 'Loan',
    interestRate: '8.75% p.a. onwards',
    estimatedEmi: 16300,
    maxLoan: 800000,
    ctaLabel: 'Apply Now',
    ctaKind: 'apply',
    targetScenarioId: 'loan-inquiry',
    prefill: { loanType: 'auto' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorProductCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvisorProductCardComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
  });

  it('Product recommendation rendering — shows product details and CTA', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Car Loan');
    expect(text).toContain('Interest Rate');
    expect(text).toContain('Apply Now');
  });
});
