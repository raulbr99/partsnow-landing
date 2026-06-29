import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PartsNow App — Coming soon",
  description:
    "The new PartsNow app — live video, chat, and catalogue search — is coming soon to the App Store and Google Play.",
  alternates: { canonical: "/app" },
  // Temporary holding page; keep it out of the index for now.
  robots: { index: false, follow: true },
};

export default function AppComingSoonPage() {
  return (
    <main className="coming-soon">
      <div className="globe" />
      <div className="cs-inner">
        <Image className="cs-logo" src="/logo-white.svg" alt="PartsNow.ai" width={190} height={52} priority />
        <span className="cs-eyebrow">Mobile app</span>
        <h1>Coming soon.</h1>
        <p className="cs-lead">
          The new <strong>PartsNow app</strong> — live video, chat, and catalogue search in one place — is
          on its way to the <strong>App Store</strong> and <strong>Google Play</strong>. We&apos;ll have it
          live shortly.
        </p>
        <p className="cs-sub">In the meantime, Mike can help you right now:</p>
        <div className="cs-actions">
          <Link className="cs-btn cs-btn-primary" href="/">Ask Mike now</Link>
          <a className="cs-btn cs-btn-ghost" href="https://partsnow.ai" target="_blank" rel="noopener">
            Browse the catalogue
          </a>
        </div>
      </div>
    </main>
  );
}
