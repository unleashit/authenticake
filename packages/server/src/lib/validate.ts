import { debugLog } from '@authenticake/common';
import { Request } from 'express';
import type { AnyObjectSchema } from 'yup';

import { YupSchemas } from '../modules/ServerAuth/types/validationTypes';
import { BadRequestError } from './customErrors';

// const mapErrorsToFields = (obj: any, errors: string[]) =>
//   Object.keys(obj).reduce((a, b, i) => ({ ...a, ...{ [b]: errors[i] } }), {});

const validate = async <T>(schema: AnyObjectSchema, data: T): Promise<T> =>
  schema
    .validate(data, { abortEarly: false })
    .then((res) => res)
    .catch((err: any) => {
      const errors = err.inner.map((e: any) => ({ [e.path]: e.errors[0] }));

      debugLog.error(errors);
      throw new BadRequestError('Validation error', {
        messages: errors,
      });
    });

export const getCustomSchemaIfAvailable = (
  req: Request,
  type: keyof YupSchemas,
) => {
  const { validations } = req.authContext;

  return (validations && validations[type]) || null;
};

export default validate;
