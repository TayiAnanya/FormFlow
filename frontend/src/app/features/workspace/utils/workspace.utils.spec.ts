import { nextApplicationId } from './application-id.generator';
import { buildProfilePrefill } from './profile-prefill.mapper';
import { buildApplicationSummary } from './application-summary.builder';

describe('workspace utils', () => {
  it('generates sequential application ids with banking prefixes', () => {
    expect(nextApplicationId('account-opening', 1)).toBe('ACC-001');
    expect(nextApplicationId('loan-inquiry', 12)).toBe('LOAN-012');
    expect(nextApplicationId('customer-support', 3)).toBe('SUP-003');
    expect(nextApplicationId('smart-credit-card', 1)).toBe('CARD-001');
  });

  it('builds profile prefill without hardcoding', () => {
    const prefill = buildProfilePrefill({
      userId: 'u1',
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      customerId: 'CUST-1234',
      updatedAt: new Date().toISOString(),
    });
    expect(prefill).toEqual({
      fullName: 'Ananya Tayi',
      applicantName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      mobile: '9876543210',
      customerId: 'CUST-1234',
    });
  });

  it('builds application summaries from submitted values', () => {
    expect(
      buildApplicationSummary('Loan Inquiry', {
        applicantName: 'Ananya',
        loanType: 'Home Loan',
        loanAmount: '2500000',
      }),
    ).toContain('Home Loan');
  });
});
