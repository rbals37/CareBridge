export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class PatientError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "PatientError";
    this.status = status;
  }
}
