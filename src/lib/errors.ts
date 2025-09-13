export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static BadRequest(message: string, details?: unknown) {
    return new AppError(message, 'BAD_REQUEST', 400, details);
  }

  static Unauthorized(message = 'Unauthorized') {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }

  static NotFound(message: string) {
    return new AppError(message, 'NOT_FOUND', 404);
  }

  static ValidationError(message: string, details?: unknown) {
    return new AppError(message, 'VALIDATION_ERROR', 422, details);
  }

  static DatabaseError(message: string, details?: unknown) {
    return new AppError(message, 'DATABASE_ERROR', 500, details);
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500);
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500);
}