import type { Metadata } from "next";
import Link from "next/link";
import { Navigation, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CopyAddressButton } from "@/components/CopyAddressButton";
import { getBusinessSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Location",
  description: "Find D'Amazon Cafe at Monkeys Canopy Resort, Sungai Long, Cheras, Selangor. Get directions, call us, or order online for pickup and delivery.",
};

const DAY_LABELS: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

export default async function LocationPage() {
  const settings = await getBusinessSettings();

  return (
    <>
      <PageHeader eyebrow="Visit Us" title="Find D'Amazon Cafe" subtitle={settings.address} compact />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-video rounded-3xl overflow-hidden card-shadow border border-jungle-100">
            {settings.mapEmbedUrl ? (
              <iframe src={settings.mapEmbedUrl} className="w-full h-full" loading="lazy" title="D'Amazon Cafe location map" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-jungle-100 text-jungle-400">Map unavailable</div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={settings.mapDirectionsUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-5 py-3 font-bold text-white hover:bg-jungle-700"
            >
              <Navigation size={16} /> GET DIRECTIONS
            </a>
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border-2 border-jungle-200 px-5 py-3 font-bold text-jungle-700 hover:border-jungle-400">
                <Phone size={16} /> CALL CAFE
              </a>
            )}
            <CopyAddressButton address={settings.address} />
          </div>

          <Link href="/menu" className="mt-4 inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-gold-400 px-6 py-3 font-bold text-jungle-950 hover:bg-gold-300">
            ORDER ONLINE
          </Link>
        </div>

        <div>
          <div className="rounded-3xl bg-jungle-50 border border-jungle-100 p-6">
            <h2 className="font-display font-bold text-jungle-950 mb-1">D&apos;Amazon Cafe</h2>
            <p className="text-sm text-jungle-600">{settings.address}</p>
            {settings.phone && <p className="text-sm text-jungle-600 mt-2">📞 {settings.phone}</p>}
            {settings.email && <p className="text-sm text-jungle-600">✉️ {settings.email}</p>}
          </div>

          <div className="mt-6 rounded-3xl bg-white card-shadow border border-jungle-50 p-6">
            <h3 className="font-display font-bold text-jungle-950 mb-3">Operating Hours</h3>
            <ul className="space-y-1.5 text-sm">
              {Object.entries(DAY_LABELS).map(([key, label]) => {
                const day = settings.operatingHours[key as keyof typeof settings.operatingHours];
                return (
                  <li key={key} className="flex justify-between text-jungle-600">
                    <span>{label}</span>
                    <span className="font-semibold">{day.closed ? "Closed" : `${day.open} – ${day.close}`}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
