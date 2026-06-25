// src/shared/errors/domain-error.ts

export class DomainError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = this.constructor.name;
    // Needed for instanceof checks to work correctly when targeting ES5 or
    // when this gets transpiled/minified — without it, `err instanceof
    // DomainError` can silently fail for subclasses in some build setups.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 409);
  }
}