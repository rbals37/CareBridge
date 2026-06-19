"use client";

const MAX_EDGE = 512;
const JPEG_QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("LOAD_FAILED"));
    };
    img.src = url;
  });
}

export async function compressPatientPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("INVALID_TYPE");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("FILE_TOO_LARGE");
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_FAILED");

  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (dataUrl.length > 600_000) {
    throw new Error("COMPRESSED_TOO_LARGE");
  }

  return dataUrl;
}

export function photoPickerErrorMessage(code: string): string {
  switch (code) {
    case "INVALID_TYPE":
      return "이미지 파일만 선택할 수 있습니다.";
    case "FILE_TOO_LARGE":
      return "8MB 이하의 사진을 선택해 주세요.";
    case "COMPRESSED_TOO_LARGE":
      return "사진 해상도가 너무 높습니다. 다른 사진을 선택해 주세요.";
    case "LOAD_FAILED":
      return "사진을 불러오지 못했습니다.";
    default:
      return "사진 처리 중 오류가 발생했습니다.";
  }
}
