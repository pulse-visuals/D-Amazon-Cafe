import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" compact />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 prose prose-headings:font-display prose-headings:text-jungle-950 prose-a:text-jungle-600">
        <p className="text-sm text-jungle-400">Last updated: {new Date().toLocaleDateString("en-MY", { dateStyle: "long" })}</p>

        <h2>Information We Collect</h2>
        <p>
          When you place an order, we collect the information needed to fulfil it: your name, phone number, email
          address (optional), and delivery address if applicable. Guest checkout is fully supported — you are never
          required to create an account to order.
        </p>

        <h2>How We Use Your Information</h2>
        <p>We use your information to process and deliver your order, communicate order updates, and respond to enquiries you send us. We do not sell your personal data to third parties.</p>

        <h2>Payment Information</h2>
        <p>
          We never see or store your full card number, CVV, or online banking credentials. Payments are processed
          directly by our payment gateway (Billplz); our systems only receive a payment status confirmation.
        </p>

        <h2>Data Retention</h2>
        <p>Order records are retained for accounting, customer service and legal purposes.</p>

        <h2>Your Rights</h2>
        <p>You may contact us to request access to, correction of, or deletion of your personal data, subject to our legal recordkeeping obligations.</p>

        <h2>Contact</h2>
        <p>For privacy questions, please reach us via the Contact page.</p>
      </article>
    </>
  );
}
