import { TestBed } from '@angular/core/testing';

import { AUTH_STORAGE } from '../../auth/services/auth-storage';
import { AuthenticationService } from '../../auth/services/authentication.service';
import { InMemoryAuthStorage } from '../../auth/testing/in-memory-auth.storage';
import { InMemoryWorkspaceStorage } from '../testing/in-memory-workspace.storage';
import { ActivityService } from './activity.service';
import { AdvisorMemoryService } from './advisor-memory.service';
import { ApplicationService } from './application.service';
import { DraftService } from './draft.service';
import { ProfileService } from './profile.service';
import { WORKSPACE_STORAGE } from './workspace-storage';

describe('Customer workspace services', () => {
  let auth: AuthenticationService;
  let profile: ProfileService;
  let applications: ApplicationService;
  let drafts: DraftService;
  let activity: ActivityService;
  let advisorMemory: AdvisorMemoryService;
  let workspaceStorage: InMemoryWorkspaceStorage;

  beforeEach(() => {
    workspaceStorage = new InMemoryWorkspaceStorage();

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        ProfileService,
        ApplicationService,
        DraftService,
        ActivityService,
        AdvisorMemoryService,
        { provide: AUTH_STORAGE, useClass: InMemoryAuthStorage },
        { provide: WORKSPACE_STORAGE, useValue: workspaceStorage },
      ],
    });

    auth = TestBed.inject(AuthenticationService);
    profile = TestBed.inject(ProfileService);
    applications = TestBed.inject(ApplicationService);
    drafts = TestBed.inject(DraftService);
    activity = TestBed.inject(ActivityService);
    advisorMemory = TestBed.inject(AdvisorMemoryService);

    auth.register({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    profile.syncFromAuth();
  });

  it('Smart prefill — maps profile fields onto common form keys', () => {
    const prefill = profile.getPrefillValues();
    expect(prefill['fullName']).toBe('Ananya Tayi');
    expect(prefill['applicantName']).toBe('Ananya Tayi');
    expect(prefill['email']).toBe('ananya@example.com');
    expect(prefill['mobileNumber']).toBe('9876543210');
    expect(prefill['mobile']).toBe('9876543210');
    expect(prefill['customerId']).toMatch(/^CUST-\d{4}$/);
  });

  it('Draft save / restore — persists values for the current user and form', () => {
    const userId = profile.getCurrentProfile()!.userId;
    drafts.saveDraft({
      userId,
      formType: 'loan-inquiry',
      formTitle: 'Loan Inquiry',
      values: { applicantName: 'Ananya Tayi', loanAmount: '500000' },
    });

    const restored = drafts.getDraft(userId, 'loan-inquiry');
    expect(restored?.values['loanAmount']).toBe('500000');
    expect(drafts.listForUser(userId).length).toBe(1);
  });

  it('Application submission — allocates ACC-001 style ids and stores full values', () => {
    const app = applications.submit({
      formType: 'account-opening',
      formTitle: 'Account Opening',
      values: { fullName: 'Ananya Tayi', email: 'ananya@example.com', accountType: 'Savings' },
    });

    expect(app.id).toBe('ACC-001');
    expect(app.status).toBe('Submitted');
    expect(app.values['accountType']).toBe('Savings');
    expect(applications.getById('ACC-001')?.formTitle).toBe('Account Opening');
  });

  it('Application history — lists only the authenticated customer applications', () => {
    applications.submit({
      formType: 'loan-inquiry',
      formTitle: 'Loan Inquiry',
      values: { applicantName: 'Ananya Tayi' },
    });
    applications.submit({
      formType: 'smart-credit-card',
      formTitle: 'Platinum Card',
      values: { fullName: 'Ananya Tayi' },
    });

    const history = applications.listForCurrentUser();
    expect(history.length).toBe(2);
    expect(history.map((item) => item.id).sort()).toEqual(['CARD-001', 'LOAN-001']);
  });

  it('Continue Application — drafts remain available until submission clears them', () => {
    const userId = profile.getCurrentProfile()!.userId;
    drafts.saveDraft({
      userId,
      formType: 'customer-support',
      formTitle: 'Support Center',
      values: { email: 'ananya@example.com', supportRequestType: 'Fraud' },
    });

    expect(drafts.listForUser(userId)[0].formType).toBe('customer-support');

    applications.submit({
      formType: 'customer-support',
      formTitle: 'Support Center',
      values: { email: 'ananya@example.com', supportRequestType: 'Fraud' },
    });

    expect(drafts.getDraft(userId, 'customer-support')).toBeNull();
    expect(applications.getById('SUP-001')?.status).toBe('Under Review');
  });

  it('Statistics generation — derives counts from applications and drafts', () => {
    const userId = profile.getCurrentProfile()!.userId;
    drafts.saveDraft({
      userId,
      formType: 'joint-family-account',
      formTitle: 'Joint Account',
      values: { fullName: 'Ananya Tayi' },
    });
    const loan = applications.submit({
      formType: 'loan-inquiry',
      formTitle: 'Loan Inquiry',
      values: { applicantName: 'Ananya' },
    });
    applications.updateStatus(loan.id, 'Approved');
    applications.submit({
      formType: 'customer-support',
      formTitle: 'Support Center',
      values: { email: 'ananya@example.com' },
    });
    applications.updateStatus('SUP-001', 'Resolved');

    const stats = applications.getStatisticsForCurrentUser();
    expect(stats.drafts).toBe(1);
    expect(stats.approved).toBe(1);
    expect(stats.resolvedSupport).toBe(1);
    expect(stats.submitted).toBe(2);
  });

  it('Activity timeline — records registration-related and application events', () => {
    activity.record({
      userId: profile.getCurrentProfile()!.userId,
      type: 'registered',
      message: 'Registered',
    });
    applications.submit({
      formType: 'account-opening',
      formTitle: 'Account Opening',
      values: { fullName: 'Ananya Tayi' },
    });

    const timeline = activity.listForUser(profile.getCurrentProfile()!.userId);
    expect(timeline.some((event) => event.message === 'Registered')).toBeTrue();
    expect(timeline.some((event) => event.message.includes('Account Opening'))).toBeTrue();
  });

  it('User-specific isolation — another customer cannot see foreign data', () => {
    applications.submit({
      formType: 'account-opening',
      formTitle: 'Account Opening',
      values: { fullName: 'Ananya Tayi' },
    });

    auth.logout();
    auth.register({
      fullName: 'Ravi Kumar',
      email: 'ravi@example.com',
      mobileNumber: '9123456780',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    profile.syncFromAuth();

    expect(applications.listForCurrentUser().length).toBe(0);
    expect(profile.getPrefillValues()['email']).toBe('ravi@example.com');
    expect(drafts.listForUser(profile.getCurrentProfile()!.userId).length).toBe(0);
  });

  it('Advisor memory — stores previous recommendations for the workspace', () => {
    advisorMemory.remember({
      sourceMessage: 'I want to buy a house',
      advice: {
        financialGoals: ['Home'],
        recommendedProducts: ['Home Loan'],
        monthlySavingsRecommendation: 20000,
        estimatedLoanEligibility: 4000000,
        estimatedEMI: 35000,
        financialHealthScore: 78,
        riskCategory: 'Moderate',
        advice: 'Consider a home loan.',
        roadmap: [],
      },
      productCards: [
        {
          id: 'home-loan',
          title: 'Home Loan',
          icon: 'pi pi-home',
          categoryLabel: 'Lending',
          ctaLabel: 'Apply Now',
          ctaKind: 'apply',
          targetScenarioId: 'loan-inquiry',
          prefill: { loanType: 'Home Loan' },
          benefits: ['Low EMI'],
        },
      ],
    });

    const remembered = advisorMemory.getForCurrentUser();
    expect(remembered?.productCards[0].targetScenarioId).toBe('loan-inquiry');
    expect(remembered?.summary).toContain('home loan');
  });
});
