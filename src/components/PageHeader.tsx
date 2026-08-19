import { FloatingLeaves } from "./FloatingLeaves";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-b from-jungle-950 to-jungle-800 text-white ${compact ? "py-14" : "py-20"}`}>
      <FloatingLeaves />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-widest text-gold-300 mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-4 text-jungle-200 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
