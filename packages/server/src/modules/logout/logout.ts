import { debugLog } from '@authenticake/common';

import { AsyncRequestHandler, catchAsync } from '../../lib';
import { AuthError } from '../../lib/customErrors';
import * as messages from '../../lib/messages';
import { isLoggedIn, logOut } from '../authentication';

// export interface User {
//   id: string;
//   email: string;
//   password: string;
//   roles: string;
// }

const logoutRoute: AsyncRequestHandler = async (req, res, _next) => {
  // const { session } = req.authContext;

  // if sessions are enabled, verify user is logged in server side
  // if (session && session.type !== 'none' && !isLoggedIn(req)) {
  //   return next(new AuthError(messages.errors.logoutFailure, { status: 401 }));
  // }

  await logOut(req, res);

  const { user_id } = res.locals.user;

  debugLog.info(`${user_id} logged out`);

  res.json({
    message: messages.success.logoutSuccess,
  });
};

export default catchAsync(logoutRoute);
