export type ApiErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  code: string;
  status: number;
  details: ApiErrorDetails;

  constructor({
    code,
    details = {},
    message,
    status = 0,
  }: {
    code: string;
    details?: ApiErrorDetails;
    message: string;
    status?: number;
  }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
