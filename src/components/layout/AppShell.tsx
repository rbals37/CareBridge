"use client";

import { cn } from "@/components/ui/utils";

interface AppShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AppShell({ sidebar, children, footer }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-mint-50 md:bg-gray-100 md:flex md:items-stretch md:justify-center md:p-4 lg:p-6">
      <div
        className={cn(
          "mx-auto flex h-[100dvh] w-full flex-col bg-white",
          "md:h-[min(920px,calc(100dvh-2rem))] md:max-w-2xl md:rounded-2xl md:border md:border-gray-200/80 md:shadow-2xl",
          "lg:h-[min(900px,calc(100dvh-3rem))] lg:max-w-6xl lg:overflow-hidden",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside
            className={cn(
              "flex shrink-0 flex-col border-b border-gray-100 bg-white",
              "lg:w-80 lg:border-b-0 lg:border-r xl:w-96",
            )}
          >
            {sidebar}
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && (
              <div
                className={cn(
                  "shrink-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md",
                  "pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6",
                )}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
