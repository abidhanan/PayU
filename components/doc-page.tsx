export function DocPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 muted">{subtitle}</p>}
      <div className="mt-8 space-y-5 text-sm leading-relaxed muted [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[color:var(--text)] [&_a]:text-brand-600 [&_a]:hover:underline dark:[&_a]:text-brand-300">
        {children}
      </div>
    </div>
  );
}
