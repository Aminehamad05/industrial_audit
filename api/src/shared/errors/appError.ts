export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, "Invalid username or password");
  }
}

export class UsernameTakenError extends AppError {
  constructor() {
    super(409, "Username is already taken");
  }
}