import { AsyncRequestHandler, catchAsync } from '../../lib/middleware';
import validate from '../../lib/validate';
import handleJWT from './jwt';
import {
  LoginSchema,
  loginSchema,
  LoginSchemaPasswordless,
  loginSchemaPasswordless,
} from './validationSchema';

const loginRoute: AsyncRequestHandler = async (req, res, next) => {
  const { localAuth } = req.authContext;
  const { email, password } = req.body;

  const isPasswordless = localAuth.type === 'passwordless';

  // TODO: add support for custom login schemas
  if (isPasswordless) {
    await validate<LoginSchemaPasswordless>(loginSchemaPasswordless, {
      email,
    });
  } else {
    await validate<LoginSchema>(loginSchema, {
      email,
      password,
    });
  }

  switch (localAuth.type) {
    case 'classic':
      next(new Error('Classic auth is not supported yet'));
      break;
    case 'jwt':
      await handleJWT(req, res, { email, password });
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

  return next();
};

export default catchAsync(loginRoute);
