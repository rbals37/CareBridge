"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";

const MAX_SECONDS = 60;

interface VoiceRecorderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size > 4 * 1024 * 1024) {
          setError("녹음이 너무 깁니다. 1분 이내로 다시 녹음해 주세요.");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const togglePlay = () => {
    if (!audioRef.current || !value) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleDelete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
    onChange(undefined);
    setSeconds(0);
  };

  if (value) {
    return (
      <div className="rounded-xl border-2 border-teal-200 bg-teal-50/50 p-4">
        <audio
          ref={audioRef}
          src={value}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
        <p className="mb-3 text-xs font-black text-teal-800">음성 메모 녹음 완료</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white active:bg-teal-700"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700">돌봄 노하우 음성</p>
            <p className="text-xs font-bold text-gray-500">저장 시 함께 전달됩니다</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 active:bg-red-100"
            aria-label="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={startRecording}
          className="mt-3 w-full rounded-lg border border-teal-300 bg-white py-2 text-xs font-black text-teal-700 active:bg-teal-50"
        >
          다시 녹음하기
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-5 transition-colors ${
          recording
            ? "border-red-400 bg-red-50 active:bg-red-100"
            : "border-teal-400 bg-white active:bg-teal-50"
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            recording ? "bg-red-100" : "bg-teal-100"
          }`}
        >
          {recording ? (
            <Square className="h-6 w-6 fill-red-600 text-red-600" />
          ) : (
            <Mic className="h-7 w-7 text-teal-600" />
          )}
        </div>
        <span className="text-sm font-black text-gray-800">
          {recording
            ? `녹음 중 ${formatTime(seconds)} · 탭하여 종료`
            : "음성으로 돌봄 노하우 남기기"}
        </span>
        {!recording && (
          <span className="text-xs font-bold text-gray-500">최대 {MAX_SECONDS}초</span>
        )}
      </button>
    </div>
  );
}
