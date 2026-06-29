"use strict";
// src/shared/errors/domain-error.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ValidationError = exports.ForbiddenError = exports.NotFoundError = exports.DomainError = void 0;
class DomainError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        // Needed for instanceof checks to work correctly when targeting ES5 or
        // when this gets transpiled/minified — without it, `err instanceof
        // DomainError` can silently fail for subclasses in some build setups.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.DomainError = DomainError;
class NotFoundError extends DomainError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ForbiddenError extends DomainError {
    constructor(message) {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends DomainError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends DomainError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
