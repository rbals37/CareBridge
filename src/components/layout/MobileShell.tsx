"use client";

interface MobileShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function MobileShell({ children, footer }: MobileShellProps) {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      {footer}
    </div>
  );
}

export function MobileFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
