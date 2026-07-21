import { FormSchema } from '../models/form-schema.model';

export type SchemaLoadSuccess = {
  status: 'success';
  schema: FormSchema;
};

export type SchemaLoadNotFound = {
  status: 'not-found';
  message: string;
};

export type SchemaLoadInvalid = {
  status: 'invalid';
  message: string;
};

export type SchemaLoadResult = SchemaLoadSuccess | SchemaLoadNotFound | SchemaLoadInvalid;
