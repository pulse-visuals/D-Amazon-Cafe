import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Payment Policy" };

export default function PaymentPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Payment Policy" compact />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 prose prose-headings:font-display prose-headings:text-jungle-950 prose-a:text-jungle-600">
        <p className="text-sm text-jungle-400">Last updated: {new Date().toLocaleDateString("en-MY", { dateStyle: "long" })}</p>

        <h2>Accepted Payment Methods</h2>
        <p>
          Online orders are paid securely through Billplz, a Malaysia-based payment gateway, which supports FPX online
          banking, credit/debit cards, and select e-wallets, depending on what is enabled on our account.
        </p>

        <h2>Security</h2>
        <p>
          We never collect or store your card number, CVV, or online banking credentials on our servers — these are
          entered directly on the payment gateway&apos;s secure page. Our system only receives a payment status
          (paid / failed) confirmation.
        </p>

        <h2>Order Confirmation</h2>
        <p>
          An order is only marked as <strong>PAID</strong> after the payment gateway confirms the transaction. If a
          payment is unsuccessful, you will see a clear message and can retry payment without re-entering your order.
        </p>

        <h2>Demo Payment Mode</h2>
        <p>
          When this site is running in DEMO PAYMENT MODE (clearly labeled on the checkout screen), no real gateway is
          contacted and no money moves — this mode exists only to demonstrate the ordering flow before the cafe owner
          connects live payment credentials.
        </p>

        <h2>Pricing</h2>
        <p>All prices are in Malaysian Ringgit (RM) and are verified against our records at checkout, regardless of what is displayed in your browser.</p>
      </article>
    </>
  );
}
