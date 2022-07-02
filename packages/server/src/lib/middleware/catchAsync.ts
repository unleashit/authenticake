import { RequestHandler } from 'express';

// export type AsyncRequestHandler = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => Promise<void>;

/**
 * Express RequestHandler that returns a promise
 */
export type AsyncRequestHandler = (
  ...args: Parameters<RequestHandler>
) => Promise<void>;

export const catchAsync =
  (handler: AsyncRequestHandler) =>
  (...args: Parameters<RequestHandler>) =>
    handler(...args).catch(args[2]);
