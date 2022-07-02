import { AnyObjectSchema } from 'yup';

export interface YupSchemas {
  signup?: AnyObjectSchema;
  login?: AnyObjectSchema;
  forgotPassword?: AnyObjectSchema;
}
