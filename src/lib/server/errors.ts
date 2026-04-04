export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(400, message, details);
}

export function unauthorized(message = 'Unauthorized'): AppError {
  return new AppError(401, message);
}

export function forbidden(message = 'Forbidden'): AppError {
  return new AppError(403, message);
}

export function notFound(message = 'Not found'): AppError {
  return new AppError(404, message);
}

export function internalError(message = 'Internal server error'): AppError {
  return new AppError(500, message);
}
