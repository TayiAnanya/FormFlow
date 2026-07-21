/**
 * Builds a short human-readable summary from submitted form values.
 */
export function buildApplicationSummary(
  formTitle: string,
  values: Record<string, unknown>,
): string {
  const highlights: string[] = [];

  const name =
    stringValue(values['fullName']) ||
    stringValue(values['applicantName']) ||
    stringValue(values['customerName']);
  if (name) {
    highlights.push(name);
  }

  const email = stringValue(values['email']);
  if (email) {
    highlights.push(email);
  }

  const amount =
    stringValue(values['loanAmount']) ||
    stringValue(values['amount']) ||
    stringValue(values['fraudAmount']);
  if (amount) {
    highlights.push(`Amount ${amount}`);
  }

  const requestType =
    stringValue(values['supportRequestType']) ||
    stringValue(values['loanType']) ||
    stringValue(values['accountType']) ||
    stringValue(values['cardType']);
  if (requestType) {
    highlights.push(requestType);
  }

  if (highlights.length === 0) {
    return `${formTitle} application`;
  }

  return `${formTitle}: ${highlights.slice(0, 3).join(' · ')}`;
}

function stringValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}
