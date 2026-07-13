"use client";

import Link from "next/link";
import Image from "next/image";
import { openMikeChat } from "@/components/MikeChat";

/** Sticky top nav shared by the landing and the truck encyclopedia pages. */
export function SiteNav() {
  return (
    <nav className="nav nav-main">
      <div className="wrap">
        <Link href="/" aria-label="PartsNow.ai home">
          <Image className="logo" src="/logo-white.svg" alt="PartsNow.ai" width={140} height={42} />
        </Link>
        <div className="nav-links">
          <Link href="/#how">How it works</Link>
          <Link href="/#about">About us</Link>
          <Link href="/#faq">FAQs</Link>
          <Link href="/trucks">Trucks</Link>
          <Link href="/guides">Guides</Link>
        </div>
        <div className="nav-right">
          <button className="btn btn-chat btn-sm" onClick={() => openMikeChat()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat with Mike
          </button>
        </div>
      </div>
    </nav>
  );
}
