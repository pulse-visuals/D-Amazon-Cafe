import { cn } from "@/lib/utils";

export function BestSellerBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-tomato-500 text-white text-[11px] font-bold px-2.5 py-1 shadow-sm", className)}>
      🔥 BEST SELLER
    </span>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-teal-500 text-white text-[11px] font-bold px-2.5 py-1 shadow-sm", className)}>
      ✨ NEW
    </span>
  );
}

export function SoldOutBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-jungle-950/80 text-white text-[11px] font-bold px-2.5 py-1", className)}>
      SOLD OUT
    </span>
  );
}

export function ComboBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold-400 text-jungle-950 text-[11px] font-extrabold px-3 py-1 shadow-md animate-pulse-soft",
        className
      )}
    >
      COMBO SPECIAL
    </span>
  );
}
