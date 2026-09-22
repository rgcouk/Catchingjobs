export class DomainError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ApplicationNotFoundError extends NotFoundError {
  constructor() {
    super('Application not found');
  }
}

export class ValidationError extends DomainError {
  constructor(message: string = 'Validation failed', statusCode: number = 400) {
    super(message, statusCode);
  }
}

export class RightToWorkRequiredError extends DomainError {
  constructor(
    message: string = 'Right to Work in the UK is required to create an application draft.',
    statusCode: number = 400,
  ) {
    super(message, statusCode);
  }
}
