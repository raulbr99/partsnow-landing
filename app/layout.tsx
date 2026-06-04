import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400","500","600","700","800"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "PartsNow AI — Find Truck Parts in Seconds",
  description: "Describe the symptom, paste a VIN, or snap a photo. The PartsNow AI searches 50,000+ heavy-duty parts with OEM cross-references and ships from Knoxville, TN.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    title: "PartsNow AI — Find Truck Parts in Seconds",
    description: "AI-powered search for heavy-duty truck and trailer parts. 50,000+ parts from trusted dealers.",
    siteName: "partsnow.ai",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
