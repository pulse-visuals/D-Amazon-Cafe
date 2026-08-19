import { cn } from "@/lib/utils";
import Image from "next/image";

// No standalone product photography was supplied with this build, so every
// product renders through this tasteful illustrated placeholder instead of a
// broken/generic stock photo. Drop real photos into /public/images/products/
// and set the product's `image` field in Admin > Menu to replace any of these.
const CATEGORY_STYLE: Record<string, { gradient: string; icon: string }> = {
  "nasi-lemak": { gradient: "from-jungle-700 via-jungle-600 to-gold-500", icon: "🍚" },
  "coffee-drinks": { gradient: "from-wood-700 via-wood-600 to-gold-500", icon: "☕" },
  "combo-deals": { gradient: "from-tomato-600 via-tomato-500 to-gold-400", icon: "🍟" },
  desserts: { gradient: "from-jungle-800 via-teal-600 to-gold-400", icon: "🥐" },
  appetizers: { gradient: "from-jungle-900 via-jungle-700 to-teal-500", icon: "🥪" },
};

export function ProductImage({
  category,
  emoji,
  image,
  alt,
  className,
  badge,
}: {
  category: string;
  emoji?: string;
  image?: string;
  alt: string;
  className?: string;
  badge?: React.ReactNode;
}) {
  const style = CATEGORY_STYLE[category] || CATEGORY_STYLE["nasi-lemak"];

  if (image) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={image} alt={alt} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
        {badge}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br flex items-center justify-center bg-leaf-texture",
        style.gradient,
        className
      )}
      role="img"
      aria-label={alt}
    >
      <div className="absolute inset-0 opacity-20 mix-blend-overlay [background-image:radial-gradient(circle_at_30%_30%,white,transparent_35%)]" />
      <span className="text-[3.2rem] sm:text-[3.8rem] drop-shadow-lg" aria-hidden>
        {emoji || style.icon}
      </span>
      {badge}
    </div>
  );
}
