export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function clientRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message;
    throw new ApiError(message ?? "The request could not be completed.", response.status);
  }
  return response.json() as Promise<T>;
}
