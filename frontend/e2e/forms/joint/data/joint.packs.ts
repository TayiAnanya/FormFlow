import type { FormFillStep } from '../../data/form.types';
import { jointFamilyHappy } from '../../data/happy.packs';

export const JOINT_SUBMIT_LABEL = 'Submit Joint Application';
export const JOINT_TITLE = 'Joint / Family Account Builder';
export const JOINT_SCENARIO = 'joint-family-account' as const;

/** Distinct primary pack (clears profile prefill concerns via explicit values). */
export function jointPrimarySteps(): FormFillStep[] {
  return jointFamilyHappy().steps;
}

export type JointRelation =
  | 'minor'
  | 'spouse'
  | 'parent'
  | 'sibling'
  | 'other';

export type JointRowPack = {
  relation: JointRelation;
  relationLabel: string;
  steps: FormFillStep[];
  needsFile?: boolean;
};

function baseJointRow(
  person: {
    fullName: string;
    dob: string;
    idNumber: string;
    occupation: string;
    email?: string;
    mobile?: string;
    idType?: { value: string; label: string };
  },
  relation: JointRelation,
  relationLabel: string,
): FormFillStep[] {
  const idType = person.idType ?? { value: 'aadhaar', label: 'Aadhaar' };
  const steps: FormFillStep[] = [
    { key: 'fullName', type: 'text', value: person.fullName },
    { key: 'dateOfBirth', type: 'date', value: person.dob },
    {
      key: 'relation',
      type: 'dropdown',
      value: relation,
      label: relationLabel,
    },
    {
      key: 'idType',
      type: 'dropdown',
      value: idType.value,
      label: idType.label,
    },
    { key: 'idNumber', type: 'text', value: person.idNumber },
    { key: 'occupation', type: 'text', value: person.occupation },
  ];
  if (person.email) {
    steps.push({ key: 'email', type: 'text', value: person.email });
  }
  if (person.mobile) {
    steps.push({ key: 'mobile', type: 'text', value: person.mobile });
  }
  return steps;
}

export function siblingRow(seed = 1): JointRowPack {
  const names = ['Arjun Mehta', 'Kavya Reddy', 'Rohan Das', 'Meera Iyer'];
  const name = names[(seed - 1) % names.length]!;
  return {
    relation: 'sibling',
    relationLabel: 'Sibling',
    steps: baseJointRow(
      {
        fullName: name,
        dob: '1990-04-12',
        idNumber: `90000000000${seed}`,
        occupation: 'Engineer',
        email: `sibling${seed}@example.com`,
        mobile: `900000000${seed}`,
      },
      'sibling',
      'Sibling',
    ),
  };
}

export function otherRow(seed = 1): JointRowPack {
  const names = ['Neha Kapoor', 'Vikram Shah', 'Anil Joshi', 'Pooja Nair'];
  const name = names[(seed - 1) % names.length]!;
  return {
    relation: 'other',
    relationLabel: 'Other',
    steps: baseJointRow(
      {
        fullName: name,
        dob: '1985-08-20',
        idNumber: `80000000000${seed}`,
        occupation: 'Consultant',
        email: `other${seed}@example.com`,
        mobile: `980000000${seed}`,
      },
      'other',
      'Other',
    ),
  };
}

export function minorRow(seed = 1): JointRowPack {
  const names = ['Aarav Kumar', 'Diya Singh', 'Ishaan Patel', 'Anaya Gupta'];
  const name = names[(seed - 1) % names.length]!;
  const steps = baseJointRow(
    {
      fullName: name,
      dob: '2015-01-15',
      idNumber: `70000000000${seed}`,
      occupation: 'Student',
      idType: { value: 'aadhaar', label: 'Aadhaar' },
    },
    'minor',
    'Minor',
  );
  steps.push(
    { key: 'guardianName', type: 'text', value: `Guardian Name ${['One', 'Two', 'Three', 'Four'][seed - 1] ?? 'One'}` },
    { key: 'guardianContact', type: 'text', value: `911111111${seed}` },
    { key: 'guardianId', type: 'text', value: `GID${seed}23456` },
  );
  return { relation: 'minor', relationLabel: 'Minor', steps };
}

export function spouseRow(seed = 1): JointRowPack {
  const names = ['Anita Nair', 'Sunita Rao', 'Lakshmi Menon', 'Deepa Pillai'];
  const name = names[(seed - 1) % names.length]!;
  const steps = baseJointRow(
    {
      fullName: name,
      dob: '1991-06-18',
      idNumber: `60000000000${seed}`,
      occupation: 'Teacher',
      email: `spouse${seed}@example.com`,
      mobile: `970000000${seed}`,
    },
    'spouse',
    'Spouse',
  );
  steps.push({ key: 'jointSignature', type: 'checkbox', value: true });
  return { relation: 'spouse', relationLabel: 'Spouse', steps };
}

export function parentRow(seed = 1): JointRowPack {
  const names = ['Ramesh Nair', 'Suresh Menon', 'Gopal Iyer', 'Krishnan Das'];
  const name = names[(seed - 1) % names.length]!;
  const steps = baseJointRow(
    {
      fullName: name,
      dob: '1965-03-10',
      idNumber: `50000000000${seed}`,
      occupation: 'Retired',
      email: `parent${seed}@example.com`,
      mobile: `960000000${seed}`,
    },
    'parent',
    'Parent',
  );
  return {
    relation: 'parent',
    relationLabel: 'Parent',
    steps,
    needsFile: true,
  };
}

/** Four distinct joint rows for max-capacity journeys. */
export function maxFourRows(): JointRowPack[] {
  return [siblingRow(1), otherRow(2), spouseRow(3), siblingRow(4)];
}

export const CROSS_APPLICANT_MESSAGES = {
  matchesPrimary: 'This applicant already exists as the Primary Applicant.',
  duplicateJoint: 'Duplicate joint applicant detected.',
  duplicateEmail: 'Email address must be unique across all applicants.',
  duplicateMobile: 'Mobile number must be unique across all applicants.',
  identityFallback:
    'Possible duplicate applicant: matching full name, date of birth, and mobile number.',
  guardianName: 'Guardian name is required for minors',
  guardianContact: 'Guardian contact is required for minors',
  guardianId: 'Guardian ID is required for minors',
  spouseSignature:
    'Joint signature confirmation is required for spouse applicants',
  parentProof: 'Please upload relationship proof for parent applicants',
  relationRequired: 'Please select a relation',
} as const;

/** Primary aadhaar used in jointFamilyHappy — for duplicate-primary packs. */
export const PRIMARY_AADHAAR = '123456789012';
export const PRIMARY_EMAIL = 'suresh.nair@example.com';
export const PRIMARY_MOBILE = '9988776655';
export const PRIMARY_FULL_NAME = 'Suresh Nair';
export const PRIMARY_DOB = '1988-11-05';
