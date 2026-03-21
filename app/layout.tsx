import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Diese Website zeigt Sperrmüll-Abfuhrtermine für den Landkreis Lüneburg
// Alle Daten beziehen sich auf den Landkreis Lüneburg in Niedersachsen

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lueneburg-sperrmuell-heute.vercel.app";

export const metadata: Metadata = {
  title: "Sperrmüll Heute Abfuhrplan Karte - Landkreis Lüneburg",
  description: "Finde Sperrmüll-Abfuhrtermine in deiner Nähe! Interaktive Karte mit aktuellen Abfuhrterminen im Landkreis Lüneburg. Offizielle Sperrmüll-Abfuhrdaten für den Landkreis Lüneburg.",
  keywords: ["Sperrmüll", "Abfuhr", "Lüneburg", "Landkreis Lüneburg", "Abfallwirtschaft", "Müllabfuhr", "Karte", "Termin", "Sperrmüllabfuhr Lüneburg"],
  authors: [{ name: "Leon Kraim" }],
  creator: "Leon Kraim",
  publisher: "Leon Kraim",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    title: "Sperrmüll Heute Abfuhrplan Karte - Landkreis Lüneburg",
    description: "Finde Sperrmüll-Abfuhrtermine in deiner Nähe! Interaktive Karte mit aktuellen Abfuhrterminen im Landkreis Lüneburg.",
    url: baseUrl,
    type: "website",
    siteName: "Sperrmüll Karte Landkreis Lüneburg",
    locale: "de_DE",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Sperrmüll Abfuhrplan Karte Landkreis Lüneburg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sperrmüll Heute Abfuhrplan Karte - Landkreis Lüneburg",
    description: "Finde Sperrmüll-Abfuhrtermine in deiner Nähe! Interaktive Karte für den Landkreis Lüneburg.",
    images: [`${baseUrl}/og-image.png`],
  },
  alternates: {
    canonical: baseUrl,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sperrmüll Karte Lüneburg",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "google-site-verification": "google1da1a000f50dacf0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Sperrmüll Karte Landkreis Lüneburg",
        description: "Interaktive Karte mit Sperrmüll-Abfuhrterminen im Landkreis Lüneburg - Offizielle Abfuhrdaten für den Landkreis Lüneburg",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#organization`,
        name: "Sperrmüll Karte Landkreis Lüneburg",
        description: "Sperrmüll-Abfuhrplan Karte für den Landkreis Lüneburg",
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Landkreis Lüneburg",
          alternateName: "Lüneburg, Deutschland, Niedersachsen",
        },
        url: baseUrl,
        sameAs: [],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Startseite",
            item: baseUrl,
          },
        ],
      },
    ],
  };

  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {/* Google Analytics - if configured */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
