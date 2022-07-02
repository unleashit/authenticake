export const errors = {
  middlewareNotArray: (hook: string) =>
    `Property ${hook} needs to be of type Array`,
  notMiddleWare:
    'Middlewares must be functions with three arguments and call next()',
  tokenMissing: 'Token is missing',
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden',
  cannotExtractToken: "Can't extract payload from token",
  sessionNotFound: 'Session not found',
  loginFailure: 'Credentials not found',
  logoutFailure: 'You must be logged in to do that',
  internalServerError: 'Internal Server Error',
};

export const success = {
  logoutSuccess: 'You are logged out',
};

export const validation = {
  forgotPassword:
    "You'll receive an email with a reset link shortly if an account exists with that email.",
};
