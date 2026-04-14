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
    "Senior full-stack engineer with 14 years building complex systems. Consulting for startups and enterprises.",
  metadataBase: new URL("https://thehashrocket.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Jason Shultz",
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
