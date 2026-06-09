import type { Metadata } from "next";
import { Montserrat, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://agent.partsnow.ai"),
  title: "Truck down? Ask Mike. — Free AI Truck Parts Consultant | PartsNow.ai",
  description: "Mike is a free AI specialist for heavy-duty truck and trailer parts. Describe the symptom, paste a VIN, or snap a photo. No account required. English & Spanish, 24/7.",
  applicationName: "PartsNow.ai",
  category: "automotive",
  keywords: [
    "truck parts",
    "heavy-duty truck parts",
    "trailer parts",
    "semi truck parts",
    "AI truck parts finder",
    "find truck part by photo",
    "VIN parts lookup",
    "OEM truck parts",
    "truck parts Knoxville TN",
    "Kenworth Peterbilt Freightliner Mack Volvo International parts",
  ],
  authors: [{ name: "PartsNow.ai" }],
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: "https://agent.partsnow.ai",
    title: "Truck down? Ask Mike. — Free AI Parts Consultant",
    description: "Free AI consultant for heavy-duty truck and trailer parts. Chat, call, or text — English or Spanish, any hour.",
    siteName: "PartsNow.ai",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Truck down? Ask Mike. — Free AI Parts Consultant",
    description: "Free AI consultant for heavy-duty truck and trailer parts. Chat, call, or text — English or Spanish, any hour.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
