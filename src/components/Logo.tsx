import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = 44,
  withText = true,
  href = "/",
  textClassName,
  className,
}: {
  size?: number;
  withText?: boolean;
  href?: string | null;
  textClassName?: string;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/images/logo.png"
        alt="D'Amazon Cafe logo — toucan bird emblem"
        width={size}
        height={size}
        priority
        className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      />
      {withText && (
        <span className={cn("font-display leading-tight", textClassName)}>
          <span className="block text-[0.65em] tracking-wide font-semibold text-jungle-200/90">D&apos;AMAZON</span>
          <span className="block text-[1em] font-extrabold tracking-tight -mt-1">CAFE</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="D'Amazon Cafe — home">
      {content}
    </Link>
  );
}
