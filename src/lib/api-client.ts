export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string; status: number; code?: string }> {
  try {
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
      return {
        error: body.error ?? "요청에 실패했습니다.",
        code: body.code,
        status: res.status,
      };
    }

    return { data: body as T, status: res.status };
  } catch {
    return {
      error: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.",
      status: 0,
    };
  }
}
