import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const APP_STORE_URL = "https://apps.apple.com/app/id6779235305";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=ai.partsnow.app";
// Native store schemes: open the store app directly without rendering the web listing.
const APP_STORE_SCHEME = "itms-apps://apps.apple.com/app/id6779235305";
const PLAY_STORE_SCHEME = "market://details?id=ai.partsnow.app";

export const metadata: Metadata = {
  title: "Get the PartsNow App",
  description:
    "Download the PartsNow app — live video, chat, and catalogue search — on the App Store or Google Play.",
  alternates: { canonical: "/app" },
  // Utility redirect page; keep it out of the index.
  robots: { index: false, follow: true },
};

export default async function AppDownloadPage() {
  const ua = (await headers()).get("user-agent") ?? "";
  if (/iPhone|iPad|iPod/i.test(ua)) redirect(APP_STORE_SCHEME);
  if (/Android/i.test(ua)) redirect(PLAY_STORE_SCHEME);

  return (
    <main className="coming-soon">
      <div className="globe" />
      <div className="cs-inner">
        <Image className="cs-logo" src="/logo-white.svg" alt="PartsNow.ai" width={190} height={52} priority />
        <span className="cs-eyebrow">Mobile app</span>
        <h1>Get the app.</h1>
        <p className="cs-lead">
          The <strong>PartsNow app</strong> — live video, chat, and catalogue search in one place — is
          available on the <strong>App Store</strong> and <strong>Google Play</strong>.
        </p>
        <div className="cs-stores">
          <a href={APP_STORE_URL} target="_blank" rel="noopener">
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
              alt="Download on the App Store"
              height={54}
            />
          </a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener">
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              height={80}
            />
          </a>
        </div>
        <div className="cs-qr">
          <Image src="/qr-app.svg" alt="QR code — scan to download the PartsNow app" width={148} height={148} />
          <span>Scan with your phone</span>
        </div>
      </div>
    </main>
  );
}
