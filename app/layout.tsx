import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { Header } from "@/components/navigation";
import { Footer } from "@/components/common";
import { siteUrl } from "@/lib/content";
import "./globals.css";

const manrope = localFont({
  src: "../public/fonts/Manrope.variable.woff2",
  display: "swap",
  variable: "--font-body",
  weight: "200 800",
});
const unbounded = localFont({
  src: "../public/fonts/Unbounded.variable.woff2",
  display: "swap",
  variable: "--font-display",
  weight: "200 900",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VolumeRail — Move value. Open markets.",
    template: "%s | VolumeRail",
  },
  description: "Pay-ins, payouts and settlement. Built around local markets.",
  applicationName: "VolumeRail",
  openGraph: {
    siteName: "VolumeRail",
    type: "website",
    locale: "en_US",
    images: ["/opengraph-image.png"],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090C0D",
  colorScheme: "dark light",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${unbounded.variable}`}
    >
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
