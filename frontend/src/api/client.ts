const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (!response.ok) {
    const raw = body?.message;
    const message = Array.isArray(raw) ? raw[0] : raw;
    throw new ApiError(response.status, message ?? 'Something went wrong. Please try again.');
  }

  return body as T;
}
