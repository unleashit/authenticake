import * as yup from 'yup';

import { AsyncRequestHandler, catchAsync } from '../../lib/middleware';
import validate, { getCustomSchemaIfAvailable } from '../../lib/validate';
import { JwtOptions } from '../ServerAuth/types/authProps';
import handleJwt from './jwt';
import { SignupSchema, signupSchema } from './signupSchema';

const signupRoute: AsyncRequestHandler = async (req, res, next) => {
  const { localAuth } = req.authContext;
  const schema = getCustomSchemaIfAvailable(req, 'signup') || signupSchema;
  const validatedBody = await validate<SignupSchema>(schema, req.body);

  switch (localAuth.type) {
    case 'classic':
      next(new Error('Classic auth is not supported yet'));
      break;
    case 'jwt':
      await handleJwt(
        req,
        res,
        validatedBody,
        localAuth.options as Required<JwtOptions>,
      );
      break;
    case 'passwordless':
      next(new Error('Passwordless auth is not supported yet'));
      break;
    case 'none':
    default:
      next(
        new Error(
          'Must choose a standard auth type until social logins are implemented',
        ),
      );
  }
  next();
};

export default catchAsync(signupRoute);
