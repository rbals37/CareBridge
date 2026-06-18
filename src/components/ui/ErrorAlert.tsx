import { AlertCircle } from "lucide-react";

export default function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <p className="text-sm font-bold leading-relaxed text-red-700">{message}</p>
    </div>
  );
}
