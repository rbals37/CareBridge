/** 입력값 끝의 "호"를 제거해 저장용 병실 번호만 남깁니다. */
export function normalizeRoomInput(value: string): string {
  return value.trim().replace(/호+$/, "").trim();
}

/** 입력값 끝의 "번"을 제거해 저장용 베드 번호만 남깁니다. */
export function normalizeBedInput(value: string): string {
  return value.trim().replace(/번+$/, "").trim();
}

/** 화면 표시용 — "3" → "3호", "3호" → "3호" */
export function formatRoomLabel(room: string): string {
  const normalized = normalizeRoomInput(room);
  return normalized ? `${normalized}호` : "";
}

/** 화면 표시용 — "1" → "1번", "1번" → "1번" */
export function formatBedLabel(bed: string): string {
  const normalized = normalizeBedInput(bed);
  return normalized ? `${normalized}번` : "";
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
