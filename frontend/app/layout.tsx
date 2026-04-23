import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ConsentBanner } from "@/components/ConsentBanner";
import { SiteHeader } from "@/components/SiteHeader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const jost = Jost({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Мастер-план Димитровграда",
  description: "Платформа сбора идей для развития Димитровграда",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    title: "Мастер-план Димитровграда",
    description: "Платформа сбора идей для развития Димитровграда",
    siteName: "Мастер-план Димитровграда",
    images: [
      {
        url: "/hero-dimitrovgrad.png",
        width: 1200,
        height: 630,
        alt: "Мастер-план Димитровграда"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Мастер-план Димитровграда",
    description: "Платформа сбора идей для развития Димитровграда",
    images: ["/hero-dimitrovgrad.png"]
  },
  referrer: "strict-origin-when-cross-origin"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#077BBD"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru-RU">
      <body className={`${jost.className} scroll-smooth bg-white`}>
        <SiteHeader />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}

