import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { spaceGrotesk, inter, jetbrainsMono } from "@/lib/fonts";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SceneProvider } from "@/components/layout/SceneProvider";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/layout/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jason Shultz — Senior Full-Stack Engineer",
    template: "%s | Jason Shultz",
  },
  description:
    "Senior software engineer and consultant with 20+ years building and rescuing the systems owner-operated and mid-size businesses run on, and keeping them running.",
  metadataBase: new URL("https://thehashrocket.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Jason Shultz",
    title: "Jason Shultz — Senior Full-Stack Engineer",
    description:
      "Senior software engineer and consultant with 20+ years building and rescuing the systems owner-operated and mid-size businesses run on, and keeping them running.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <PersonJsonLd />
        <WebSiteJsonLd />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <SceneProvider>
          <main id="main" role="main">
            {children}
          </main>
        </SceneProvider>
        <Footer />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
