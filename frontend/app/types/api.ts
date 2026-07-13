export interface ApiError {
  status: number;
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
}

export function extractError(e: ApiError, fallback: string): string {
  return e?.data?.message ?? fallback;
}
