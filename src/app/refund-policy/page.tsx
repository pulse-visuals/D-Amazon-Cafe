import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Refund Policy" compact />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 prose prose-headings:font-display prose-headings:text-jungle-950 prose-a:text-jungle-600">
        <p className="text-sm text-jungle-400">Last updated: {new Date().toLocaleDateString("en-MY", { dateStyle: "long" })}</p>

        <h2>Order Issues</h2>
        <p>
          As food is prepared fresh to order, we do not generally offer refunds for change of mind once preparation
          has started. If an item arrives incorrect, missing, or not as described, please contact us within 24 hours
          via phone or WhatsApp with your order number and we will make it right — with a replacement, store credit,
          or refund at our discretion.
        </p>

        <h2>Failed / Unsuccessful Payments</h2>
        <p>
          If a payment is deducted but your order does not show as confirmed, please contact us with your order number
          and payment reference. We will verify with our payment gateway and refund any duplicate or failed charge.
        </p>

        <h2>Cancellations</h2>
        <p>Orders may be cancelled for a full refund if cancelled before preparation begins. Contact us as soon as possible after ordering if you need to cancel.</p>

        <h2>How Refunds Are Processed</h2>
        <p>Approved refunds are returned to your original payment method through our payment gateway and may take several business days to appear, depending on your bank or e-wallet provider.</p>
      </article>
    </>
  );
}
