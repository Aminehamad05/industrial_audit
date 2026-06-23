"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRejectedError = exports.AccountBlockedError = exports.AccountPendingError = exports.UsernameTakenError = exports.InvalidCredentialsError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.AppError = AppError;
class InvalidCredentialsError extends AppError {
    constructor() {
        super(401, "Invalid username or password");
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class UsernameTakenError extends AppError {
    constructor() {
        super(409, "Username is already taken");
    }
}
exports.UsernameTakenError = UsernameTakenError;
class AccountPendingError extends AppError {
    constructor() {
        super(403, "Your account is awaiting administrator approval");
    }
}
exports.AccountPendingError = AccountPendingError;
class AccountBlockedError extends AppError {
    constructor() {
        super(403, "Your account has been blocked. Contact an administrator");
    }
}
exports.AccountBlockedError = AccountBlockedError;
class AccountRejectedError extends AppError {
    constructor() {
        super(403, "Your account request was not approved");
    }
}
exports.AccountRejectedError = AccountRejectedError;
