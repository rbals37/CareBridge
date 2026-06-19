import { cn } from "@/components/ui/utils";

const SIZE_CLASS = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-lg md:h-14 md:w-14",
  lg: "h-16 w-16 text-xl md:h-20 md:w-20",
  xl: "h-11 w-11 text-lg md:h-12 md:w-12",
} as const;

interface PatientAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export default function PatientAvatar({
  name,
  photoUrl,
  size = "md",
  className,
}: PatientAvatarProps) {
  const initial = name.charAt(0) || "?";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${name} 환자`}
        className={cn(
          "shrink-0 rounded-full border-2 border-teal-100 object-cover",
          SIZE_CLASS[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-teal-100 bg-teal-50 font-black text-teal-700",
        SIZE_CLASS[size],
        className,
      )}
    >
      {initial}
    </div>
  );
}
