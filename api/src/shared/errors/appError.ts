export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidRoleError extends AppError {
  constructor() {
    super(401, "Invalid Role");
  }
}
export class InvalidPlantError extends AppError {
  constructor() {
    super(401, "Invalid Plant");
  }
}
export class MissingMentorNameError extends AppError {
  constructor() {
    super(401, "missing superVisor name");
  }
}
export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, "Invalid username or password");
  }
}
export class EmailTakenError extends AppError {
  constructor() {
    super(409, "Email is already taken");
  }
}
export class UsernameTakenError extends AppError {
  constructor() {
    super(409, "Username is already taken");
  }
}
export class AccountPendingError extends AppError {
  constructor() {
    super(403, "Your account is awaiting administrator approval");
  }
}

export class AccountBlockedError extends AppError {
  constructor() {
    super(403, "Your account has been blocked. Contact an administrator");
  }
}

export class AccountRejectedError extends AppError {
  constructor() {
    super(403, "Your account request was not approved");
  }
}