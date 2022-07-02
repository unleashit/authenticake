import { debugLog } from '@authenticake/common';
import { NextFunction, Request, Response } from 'express';

import ServerAuth from '../../modules/ServerAuth/ServerAuth';
import { AuthenticakeError } from '../customErrors';
import { errors } from '../messages';

export const errorHandler = async (
  err: AuthenticakeError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const serverAuth = await ServerAuth();
  const { logger } = serverAuth;

  const shouldReportSpecificError = (e: Error) =>
    e instanceof AuthenticakeError ||
    e.message === 'invalid csrf token'.toLowerCase();

  // If not instance of AuthenticakeError or csrf token failure,
  // send a generic message for security purposes
  const [message, status] = ((e): [string, number] => [
    shouldReportSpecificError(e) ? e.message : errors.internalServerError,
    shouldReportSpecificError(e) && 'status' in e ? e.status : 500,
  ])(err);

  const additionalFields =
    err instanceof AuthenticakeError
      ? Object.entries(err)
          .filter(
            ([key]) => !['status', 'name', 'message', 'stack'].includes(key),
          )
          .reduce((a, [key, val]) => ({ ...a, [key]: val }), {})
      : null;

  if (logger) {
    logger(err);
  } else {
    debugLog.error(err);
  }

  res.status(status).json({
    error: message,
    ...additionalFields,
  });
  // next();
};
