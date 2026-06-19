const MAX_PHOTO_LENGTH = 600_000;
const ALLOWED_PREFIXES = [
  "data:image/jpeg",
  "data:image/png",
  "data:image/webp",
];

export function validatePatientPhoto(input: unknown): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null || input === "") return null;

  if (typeof input !== "string") {
    throw new Error("INVALID_PHOTO");
  }

  if (!ALLOWED_PREFIXES.some((prefix) => input.startsWith(prefix))) {
    throw new Error("INVALID_PHOTO");
  }

  if (input.length > MAX_PHOTO_LENGTH) {
    throw new Error("PHOTO_TOO_LARGE");
  }

  return input;
}

export function photoValidationMessage(code: string): string {
  switch (code) {
    case "INVALID_PHOTO":
      return "지원하지 않는 이미지 형식입니다. JPG, PNG, WEBP만 가능합니다.";
    case "PHOTO_TOO_LARGE":
      return "이미지 용량이 너무 큽니다. 더 작은 사진을 선택해 주세요.";
    default:
      return "이미지 처리 중 오류가 발생했습니다.";
  }
}
