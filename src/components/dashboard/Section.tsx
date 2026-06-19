import { cn } from "@/components/ui/utils";

export default function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 lg:mb-0", className)}>
      <h3 className="mb-3 flex items-center gap-2 px-0.5 text-base font-black text-gray-900 md:text-lg">
        <span className="h-4 w-1.5 rounded-full bg-teal-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}
