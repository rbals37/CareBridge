"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export default function VoiceMemoPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white active:bg-teal-700"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
      </button>
      <div className="flex-1">
        <p className="text-sm font-black text-gray-800">전 근무자의 음성 인계</p>
        <p className="text-xs font-bold text-gray-500">탭하여 재생</p>
      </div>
    </div>
  );
}
