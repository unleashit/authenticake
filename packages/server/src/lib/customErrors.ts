// eslint-disable-next-line max-classes-per-file
export abstract class AuthenticakeError extends Error {
  public status: number = 500;

  // eslint-disable-next-line no-undef
  [key: string]: any;

  mergeFields<T extends Record<string, any>>(obj: T): void {
    const keys = Object.keys(obj);

    if (keys.length > 0) {
      keys.forEach((key) => {
        this[key] = obj[key];
      });
    }
  }
}

export class BadRequestError<T> extends AuthenticakeError {
  constructor(message = 'Bad Request', obj?: T) {
    super(message);

    // Set the prototype explicitly for builtin objs when using <= ES5 target
    // https://www.typescriptlang.org/docs/handbook/2/classes.html
    // Object.setPrototypeOf(this, BadRequestError.prototype);

    this.status = 400;
    obj && this.mergeFields(obj);
  }
}

export class UnauthorizedError<T> extends AuthenticakeError {
  constructor(message = 'Unauthorized', obj?: T) {
    super(message);

    this.status = 401;
    obj && this.mergeFields(obj);
  }
}

export class ForbiddenError<T> extends AuthenticakeError {
  constructor(message = 'Forbidden', obj?: T) {
    super(message);

    this.status = 403;
    obj && this.mergeFields(obj);
  }
}

export class ConflictError<T> extends AuthenticakeError {
  constructor(message = 'Conflict', obj?: T) {
    super(message);

    this.status = 409;
    obj && this.mergeFields(obj);
  }
}

export class InternalServerError<T> extends AuthenticakeError {
  constructor(message = 'Internal Server Error', obj?: T) {
    super(message);

    this.status = 500;
    obj && this.mergeFields(obj);
  }
}

export class AuthError<
  T extends Record<string, unknown>,
> extends AuthenticakeError {
  constructor(message = 'Error', obj?: T) {
    super(message);

    obj && this.mergeFields(obj);
  }
}
