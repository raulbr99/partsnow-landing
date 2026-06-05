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
  title: "Truck down? Ask Steve. — Free AI Truck Parts Consultant | PartsNow.ai",
  description: "Steve is a free AI specialist for heavy-duty truck and trailer parts. Describe the symptom, paste a VIN, or snap a photo. No account required. English & Spanish, 24/7.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    title: "Truck down? Ask Steve. — Free AI Parts Consultant",
    description: "Free AI consultant for heavy-duty truck and trailer parts. Chat, call, or text — English or Spanish, any hour.",
    siteName: "PartsNow.ai",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
