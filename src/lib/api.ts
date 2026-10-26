import type { Envelope } from './types';

const SERVER_BASE = process.env.API_URL ?? 'http://127.0.0.1:4000';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = 'ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const err = json as { error?: { code?: string; message?: string; details?: unknown }; message?: string } | null;
    throw new ApiError(
      err?.error?.message ?? err?.message ?? `Request failed (${res.status})`,
      err?.error?.code ?? 'ERROR',
      res.status,
      err?.error?.details,
    );
  }
  return json as T;
}

/** Browser-side API call through the Next.js proxy. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const res = await fetch(`/api/public${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  return parse<T>(res);
}

export async function apiEnvelope<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  return api<Envelope<T>>(path, init);
}

/** Server component fetch, called directly against the Express API. */
export async function serverGetEnvelope<T>(path: string, revalidate = 60): Promise<Envelope<T>> {
  const res = await fetch(`${SERVER_BASE}/api/public${path}`, {
    headers: { accept: 'application/json' },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new ApiError(`Failed to load ${path}`, 'SERVER_FETCH_FAILED', res.status);
  }
  return (await res.json()) as Envelope<T>;
}

export async function serverGet<T>(path: string, revalidate = 60): Promise<T> {
  return (await serverGetEnvelope<T>(path, revalidate)).data;
}

export async function serverGetSafe<T>(path: string, fallback: T, revalidate = 60): Promise<T> {
  try {
    return await serverGet<T>(path, revalidate);
  } catch {
    return fallback;
  }
}

export function money(amount: number, currency = 'EUR', locale = 'en-IE'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
