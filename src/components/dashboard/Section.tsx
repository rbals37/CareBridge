export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-3 flex items-center gap-2 px-0.5 text-base font-black text-gray-900">
        <span className="h-4 w-1.5 rounded-full bg-teal-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}
