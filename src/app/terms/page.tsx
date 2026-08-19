import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" compact />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 prose prose-headings:font-display prose-headings:text-jungle-950 prose-a:text-jungle-600">
        <p className="text-sm text-jungle-400">Last updated: {new Date().toLocaleDateString("en-MY", { dateStyle: "long" })}</p>

        <h2>1. About These Terms</h2>
        <p>
          These Terms &amp; Conditions govern your use of the D&apos;Amazon Cafe website and online ordering system
          (&ldquo;the Service&rdquo;), operated from Shop No. R03, Lot.683, Monkeys Canopy Resort, Jalan Persiaran Bukit
          Enggang SG Long Hill, Sungai Long, Cheras, Selangor, Malaysia. By placing an order through the Service, you
          agree to these terms.
        </p>

        <h2>2. Orders</h2>
        <p>
          All orders are subject to product availability. Prices shown are in Malaysian Ringgit (RM) and are determined
          by our system at the time of order confirmation — prices submitted from your browser are always re-verified
          against our records before your order is accepted, so displayed totals may occasionally differ from a stale
          page if prices were updated by the cafe in the meantime.
        </p>

        <h2>3. Pickup & Delivery</h2>
        <p>
          Estimated preparation and delivery times are provided in good faith and are not guaranteed. Delivery is
          available within the zones and fees configured by D&apos;Amazon Cafe at the time of your order.
        </p>

        <h2>4. Cancellations</h2>
        <p>
          Orders that have not yet begun preparation may be cancelled by contacting the cafe directly by phone or
          WhatsApp. Once preparation has started, cancellation may not be possible.
        </p>

        <h2>5. Conduct</h2>
        <p>You agree not to misuse the Service, attempt to interfere with its operation, or submit fraudulent orders.</p>

        <h2>6. Changes</h2>
        <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>

        <h2>7. Contact</h2>
        <p>Questions about these terms can be sent to us via the Contact page or WhatsApp.</p>
      </article>
    </>
  );
}
