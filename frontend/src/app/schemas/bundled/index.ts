import { FormSchema } from '../../models/form-schema.model';

import { ACCOUNT_OPENING_SCHEMA } from './account-opening.schema';
import { CUSTOMER_SUPPORT_SCHEMA } from './customer-support.schema';
import { JOINT_FAMILY_ACCOUNT_SCHEMA } from './joint-family-account.schema';
import { LOAN_INQUIRY_SCHEMA } from './loan-inquiry.schema';
import { SMART_CREDIT_CARD_SCHEMA } from './smart-credit-card.schema';

/** Static bundled schema catalog keyed by FormSchema id. */
export const BUNDLED_SCHEMAS: Record<string, FormSchema> = {
  [ACCOUNT_OPENING_SCHEMA.id]: ACCOUNT_OPENING_SCHEMA,
  [LOAN_INQUIRY_SCHEMA.id]: LOAN_INQUIRY_SCHEMA,
  [SMART_CREDIT_CARD_SCHEMA.id]: SMART_CREDIT_CARD_SCHEMA,
  [CUSTOMER_SUPPORT_SCHEMA.id]: CUSTOMER_SUPPORT_SCHEMA,
  [JOINT_FAMILY_ACCOUNT_SCHEMA.id]: JOINT_FAMILY_ACCOUNT_SCHEMA,
};

export const BUNDLED_SCHEMA_LIST: FormSchema[] = Object.values(BUNDLED_SCHEMAS);
