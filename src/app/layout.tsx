import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StorefrontChrome } from "@/components/StorefrontChrome";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "D'Amazon Cafe | Nasi Lemak, Coffee & Cafe in Sungai Long, Cheras",
    template: "%s | D'Amazon Cafe",
  },
  description:
    "D'Amazon Cafe in Sungai Long, Cheras, Selangor. Order Nasi Lemak, coffee, refreshing drinks, pastries, desserts and Western favourites online.",
  keywords: [
    "D'Amazon Cafe",
    "Sungai Long cafe",
    "Cheras cafe",
    "Nasi Lemak Sungai Long",
    "coffee Cheras",
    "online food order Sungai Long",
  ],
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: SITE_URL,
    siteName: "D'Amazon Cafe",
    title: "D'Amazon Cafe | Nasi Lemak, Coffee & Cafe in Sungai Long, Cheras",
    description:
      "Order Nasi Lemak, coffee, refreshing drinks, pastries, desserts and Western favourites online from D'Amazon Cafe, Sungai Long.",
    images: [{ url: "/images/logo.png", width: 1024, height: 1024, alt: "D'Amazon Cafe logo" }],
  },
  twitter: {
    card: "summary",
    title: "D'Amazon Cafe | Sungai Long, Cheras",
    description: "Order Nasi Lemak, coffee, pastries and Western favourites online.",
    images: ["/images/logo.png"],
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a2e22",
  width: "device-width",
  initialScale: 1,
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "D'Amazon Cafe",
  image: `${SITE_URL}/images/logo.png`,
  url: SITE_URL,
  telephone: "+60123456789",
  priceRange: "RM4 - RM20",
  servesCuisine: ["Malaysian", "Western", "Cafe"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Shop No. R03, Lot.683, Monkeys Canopy Resort, Jalan Persiaran Bukit Enggang SG Long Hill",
    addressLocality: "Sungai Long, Cheras",
    addressRegion: "Selangor",
    addressCountry: "MY",
  },
  menu: `${SITE_URL}/menu`,
  acceptsReservations: "False",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday"],
      opens: "08:00",
      closes: "23:00",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream-50 text-jungle-950">
        <StorefrontChrome>{children}</StorefrontChrome>
      </body>
    </html>
  );
}
