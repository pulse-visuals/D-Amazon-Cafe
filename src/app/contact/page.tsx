import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getBusinessSettings } from "@/lib/settings";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with D'Amazon Cafe in Sungai Long, Cheras — call, WhatsApp, email, or send us a message.",
};

export default async function ContactPage() {
  const settings = await getBusinessSettings();

  return (
    <>
      <PageHeader eyebrow="Get in Touch" title="Contact D'Amazon Cafe" compact />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-2 gap-10">
        <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-8">
          <h2 className="font-display text-xl font-extrabold text-jungle-950 mb-5">Send Us a Message</h2>
          <ContactForm email={settings.email || "hello@damazoncafe.my"} />
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-jungle-950 text-white p-6 sm:p-8">
            <h3 className="font-display font-bold mb-4">Reach Us Directly</h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-gold-300 mt-0.5" /> {settings.address}
              </p>
              {settings.phone && (
                <p className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-gold-300" /> {settings.phone}
                </p>
              )}
              {settings.email && (
                <p className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-gold-300" /> {settings.email}
                </p>
              )}
            </div>
          </div>

          {settings.whatsappNumber && (
            <WhatsAppButton number={settings.whatsappNumber} className="w-full" message="Hi D'Amazon Cafe! I have a question." />
          )}

          <div className="rounded-3xl bg-jungle-50 border border-jungle-100 p-6">
            <h3 className="font-display font-bold text-jungle-950 mb-2">Prefer to Order?</h3>
            <p className="text-sm text-jungle-500">Skip the wait — browse our menu and order online for pickup or delivery.</p>
          </div>
        </div>
      </section>
    </>
  );
}
