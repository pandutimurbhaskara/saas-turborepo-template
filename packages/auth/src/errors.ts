export type AuthErrorCode = 'invalid_credentials' | 'email_taken' | 'invalid_input' | 'internal'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid email or password.') {
    super('invalid_credentials', message)
  }
}

export class EmailTakenError extends AuthError {
  constructor(message = 'An account with this email already exists.') {
    super('email_taken', message)
  }
}
