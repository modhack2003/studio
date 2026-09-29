'use client';

export const UNAUTHORIZED_EVENT = 'admin:unauthorized';

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown; formData?: FormData; signal?: AbortSignal };

/**
 * fetch wrapper for the admin dashboard:
 * - sends/parses JSON
 * - throws ApiError with the server's message on non-2xx
 * - broadcasts UNAUTHORIZED_EVENT on 401 so the shell can show the PIN screen again
 */
export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const init: RequestInit = { method: opts.method ?? 'GET', credentials: 'same-origin', signal: opts.signal };
  if (opts.formData) init.body = opts.formData;
  else if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
    init.headers = { 'Content-Type': 'application/json' };
  }

  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError('Network error — check your connection.', 0);
  }

  const type = res.headers.get('content-type') ?? '';
  const data: unknown = type.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : typeof data === 'string' && data
          ? data
          : `Request failed (${res.status})`) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
