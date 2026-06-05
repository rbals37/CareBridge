export default function LoadingScreen() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-mint-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        <p className="text-sm font-bold text-teal-700">불러오는 중…</p>
      </div>
    </div>
  );
}
