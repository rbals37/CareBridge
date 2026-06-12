export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string; status: number }> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { error: body.error ?? "요청에 실패했습니다.", status: res.status };
  }

  return { data: body as T, status: res.status };
}
