import { cn } from "@/components/ui/utils";

type AppPageVariant = "default" | "auth" | "form";

interface AppPageProps {
  children: React.ReactNode;
  className?: string;
  variant?: AppPageVariant;
}

const VARIANT_CLASS: Record<AppPageVariant, string> = {
  default:
    "bg-mint-50 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
  auth:
    "bg-transparent md:max-w-md lg:max-w-lg",
  form:
    "bg-gray-50 md:max-w-xl lg:max-w-2xl",
};

export default function AppPage({
  children,
  className,
  variant = "default",
}: AppPageProps) {
  return (
    <div className="min-h-[100dvh] bg-mint-50 md:bg-gray-100 md:py-6 lg:py-8">
      <div
        className={cn(
          "mx-auto flex min-h-[100dvh] w-full flex-col md:min-h-0",
          "md:rounded-2xl md:border md:border-gray-200/80 md:shadow-xl",
          VARIANT_CLASS[variant],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AppPageMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8", className)}>
      {children}
    </main>
  );
}

export function AppPageHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-gray-100 bg-white px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]",
        "md:rounded-t-2xl md:px-6 md:pt-5",
        className,
      )}
    >
      {children}
    </header>
  );
}
