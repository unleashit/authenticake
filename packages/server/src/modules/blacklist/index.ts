import { debugLog } from '@authenticake/common';

import { AsyncRequestHandler, catchAsync } from '../../lib/middleware';
import ServerAuth from '../ServerAuth/ServerAuth';

// takes a user id and adds to blacklist
export const add: AsyncRequestHandler = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  // const { query } = await ServerAuth();
  // const { database } = req.authContext;

  // if blacklist isn't configured, return 401
  // if blacklist = whitelist, return 401
  // if blackist = refresh or access

  debugLog.info(`Blacklisted user: ${userId}`);
  res.sendStatus(200);
  next();
});

export const check: AsyncRequestHandler = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { dbQuery } = await ServerAuth();

  debugLog.info(`Blacklist route hit with user: ${userId}`);

  const found = !!(await dbQuery.findUserById({ id: userId }));

  res.json({ found });
  next();
});
