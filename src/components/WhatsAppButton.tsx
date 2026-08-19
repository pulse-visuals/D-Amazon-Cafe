import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  number,
  message = "Hi D'Amazon Cafe! I'd like to ask about my order.",
  className,
  children,
}: {
  number: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg hover:brightness-105 active:scale-[0.98] transition-all",
        className
      )}
    >
      <MessageCircle size={18} />
      {children || "CONTACT D'AMAZON CAFE ON WHATSAPP"}
    </a>
  );
}
