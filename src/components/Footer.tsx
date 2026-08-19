import Link from "next/link";
import { MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./Logo";

// lucide-react no longer ships brand/logo icons, so social marks are simple inline SVGs.
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.35A20 20 0 0 0 14.2 4.2c-2.27 0-3.82 1.38-3.82 3.92V10.5H8v3h2.38V21h3.12Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const LINK_COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/menu", label: "Menu" },
      { href: "/menu", label: "Order Online" },
      { href: "/about", label: "About Us" },
      { href: "/location", label: "Location" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/refund-policy", label: "Refund Policy" },
      { href: "/payment-policy", label: "Payment Policy" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-jungle-950 text-jungle-100 mt-24 print:hidden">
      <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent to-jungle-950" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Logo size={48} textClassName="text-white" />
            <p className="mt-4 text-sm text-jungle-300 leading-relaxed max-w-xs">
              A tropical escape for great Malaysian food and great coffee, tucked into Sungai Long&apos;s green canopy.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="D'Amazon Cafe on Facebook" className="rounded-full bg-white/10 p-2.5 hover:bg-gold-400 hover:text-jungle-950 transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="D'Amazon Cafe on Instagram" className="rounded-full bg-white/10 p-2.5 hover:bg-gold-400 hover:text-jungle-950 transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="D'Amazon Cafe on WhatsApp" className="rounded-full bg-white/10 p-2.5 hover:bg-gold-400 hover:text-jungle-950 transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold-300">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-jungle-300">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold-300">Visit Us</h3>
            <address className="mt-4 space-y-3 text-sm text-jungle-300 not-italic">
              <p className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-jungle-400" />
                Shop No. R03, Lot.683, Monkeys Canopy Resort, Jalan Persiaran Bukit Enggang SG Long Hill, Sungai Long, Cheras, Selangor, Malaysia
              </p>
              <p className="flex gap-2 items-center">
                <Phone size={16} className="shrink-0 text-jungle-400" /> +60 12-345 6789
              </p>
              <p className="flex gap-2 items-center">
                <Mail size={16} className="shrink-0 text-jungle-400" /> hello@damazoncafe.my
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-jungle-400">
          <p>© {year} D&apos;Amazon Cafe. All Rights Reserved.</p>
          <p>Made with 🌿 in Sungai Long, Cheras</p>
        </div>
      </div>
    </footer>
  );
}
