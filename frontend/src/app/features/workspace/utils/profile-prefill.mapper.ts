import { CustomerProfile } from '../models/workspace.model';

/**
 * Maps authenticated profile fields onto common form keys used across schemas.
 * Does not invent values — only copies what the profile already has.
 */
export function buildProfilePrefill(profile: CustomerProfile): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  if (profile.fullName) {
    values['fullName'] = profile.fullName;
    values['applicantName'] = profile.fullName;
  }

  if (profile.email) {
    values['email'] = profile.email;
  }

  if (profile.mobileNumber) {
    values['mobileNumber'] = profile.mobileNumber;
    values['mobile'] = profile.mobileNumber;
  }

  if (profile.customerId) {
    values['customerId'] = profile.customerId;
  }

  return values;
}
