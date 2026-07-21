import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';

import { BankingAdvisorService } from '../../services/banking-advisor.service';
import { FormPrefillService } from '../../services/form-prefill.service';
import { AUTH_STORAGE } from '../../../auth/services/auth-storage';
import { AuthenticationService } from '../../../auth/services/authentication.service';
import { InMemoryAuthStorage } from '../../../auth/testing/in-memory-auth.storage';
import { WORKSPACE_STORAGE } from '../../../workspace/services/workspace-storage';
import { InMemoryWorkspaceStorage } from '../../../workspace/testing/in-memory-workspace.storage';
import { BankingAdvisorPage } from './banking-advisor-page';

describe('BankingAdvisorPage', () => {
  let fixture: ComponentFixture<BankingAdvisorPage>;
  let component: BankingAdvisorPage;
  let advisorService: jasmine.SpyObj<BankingAdvisorService>;
  let prefill: FormPrefillService;
  let router: Router;

  const sampleAdvice = {
    financialGoals: ['Buy a Car', 'Travel Abroad'],
    recommendedProducts: ['Car Loan', 'High Interest Savings Account'],
    monthlySavingsRecommendation: 12000,
    estimatedLoanEligibility: 800000,
    estimatedEMI: 16300,
    financialHealthScore: 82,
    riskCategory: 'Low',
    advice: 'Increase your monthly savings by 10% to improve loan eligibility.',
    roadmap: [
      { period: 'Months 1-3', goal: 'Build Emergency Fund' },
      { period: 'Months 4-6', goal: 'Improve Credit Score' },
    ],
  };

  beforeEach(async () => {
    advisorService = jasmine.createSpyObj('BankingAdvisorService', ['advise']);

    await TestBed.configureTestingModule({
      imports: [BankingAdvisorPage],
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'forms/:scenarioId', children: [] },
          { path: 'advisor', component: BankingAdvisorPage },
        ]),
        FormPrefillService,
        AuthenticationService,
        { provide: BankingAdvisorService, useValue: advisorService },
        { provide: AUTH_STORAGE, useClass: InMemoryAuthStorage },
        { provide: WORKSPACE_STORAGE, useClass: InMemoryWorkspaceStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BankingAdvisorPage);
    component = fixture.componentInstance;
    prefill = TestBed.inject(FormPrefillService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders welcome message and suggested prompts', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Smart Banking Advisor');
    expect(text).toContain('I want to buy a car.');
  });

  it('Product recommendation rendering — shows goals, score, roadmap, and products', fakeAsync(() => {
    advisorService.advise.and.resolveTo({
      success: true,
      advice: sampleAdvice,
      productCards: [
        {
          id: 'car-loan',
          title: 'Car Loan',
          icon: 'pi pi-car',
          categoryLabel: 'Loan',
          ctaLabel: 'Apply Now',
          ctaKind: 'apply',
          targetScenarioId: 'loan-inquiry',
          prefill: { loanType: 'auto', loanAmount: '800000' },
          interestRate: '8.75% p.a. onwards',
          estimatedEmi: 16300,
          maxLoan: 800000,
        },
      ],
    });

    const harness = component as unknown as {
      draftMessage: string;
      submit: () => Promise<void>;
    };
    harness.draftMessage = 'I want to buy a car next year.';
    harness.submit();
    tick();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Buy a Car');
    expect(text).toContain('Car Loan');
    expect(text).toContain('Build Emergency Fund');
    expect(text).toContain('82');
    expect(text).toContain('Health Score');
  }));

  it('Apply Now navigation — queues prefill and navigates to existing form', fakeAsync(async () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const harness = component as unknown as {
      onProductApply: (product: {
        targetScenarioId: string;
        prefill: Record<string, unknown>;
      }) => Promise<void>;
    };

    await harness.onProductApply({
      targetScenarioId: 'loan-inquiry',
      prefill: { loanType: 'auto', loanAmount: '800000', purpose: 'Buy a Car' },
    });
    tick();

    expect(prefill.peekPrefill()?.['loanType']).toBe('auto');
    expect(navigateSpy).toHaveBeenCalledWith(['/forms', 'loan-inquiry']);
  }));

  it('Error handling — shows friendly message when AI fails', fakeAsync(() => {
    advisorService.advise.and.resolveTo({
      success: false,
      errorMessage:
        "We couldn't fully understand your financial goals. Please provide a little more information.",
    });

    const harness = component as unknown as {
      draftMessage: string;
      submit: () => Promise<void>;
    };
    harness.draftMessage = 'hello';
    harness.submit();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("couldn't fully understand");
  }));
});
