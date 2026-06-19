"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import PatientAvatar from "@/components/PatientAvatar";
import {
  compressPatientPhoto,
  photoPickerErrorMessage,
} from "@/lib/compress-image";

interface PatientPhotoPickerProps {
  name: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}

export default function PatientPhotoPicker({
  name,
  value,
  onChange,
}: PatientPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setProcessing(true);
    setError("");

    try {
      const dataUrl = await compressPatientPhoto(file);
      onChange(dataUrl);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN";
      setError(photoPickerErrorMessage(code));
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={processing}
        onClick={() => inputRef.current?.click()}
        className="group relative disabled:opacity-60"
        aria-label="환자 사진 선택"
      >
        <PatientAvatar
          name={name || "?"}
          photoUrl={value}
          size="lg"
          className="transition-opacity group-hover:opacity-90"
        />
        <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-md">
          <Camera className="h-4 w-4" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="text-center">
        <p className="text-xs font-black text-gray-700 md:text-sm">환자 사진 (선택)</p>
        <p className="mt-0.5 text-[10px] font-bold text-gray-500 md:text-xs">
          {processing ? "사진 처리 중…" : "탭해서 사진을 등록하세요"}
        </p>
      </div>

      {value && !processing && (
        <button
          type="button"
          onClick={() => {
            onChange(undefined);
            setError("");
          }}
          className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          사진 삭제
        </button>
      )}

      {error && (
        <p className="max-w-xs text-center text-xs font-bold text-red-600">{error}</p>
      )}
    </div>
  );
}
