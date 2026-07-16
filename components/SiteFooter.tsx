import Link from "next/link";
import Image from "next/image";

/** Slim footer shared by the landing and the truck encyclopedia pages. */
export function SiteFooter() {
  return (
    <footer className="footer footer-slim">
      <div className="wrap">
        <div className="fbrand">
          <Image className="logo" src="/logo-white.svg" alt="PartsNow.ai" width={120} height={28} />
          <p className="blurb">AI-powered truck and trailer parts. 16,000+ parts from trusted dealers, shipped nationwide. Based in Knoxville, TN.</p>
          <p className="flinks">
            <Link href="/trucks">US Truck Encyclopedia</Link> · <Link href="/guides">Truck Guides</Link> · <a href="https://partsnow.ai" target="_blank" rel="noopener">Browse the catalogue</a>
          </p>
        </div>
        <div className="fcontact-block">
          <div className="fcontact">
            EN <a href="tel:+18652905485">(865) 290-5485</a> · ES <a href="tel:+18652175813">(865) 217-5813</a><br />
            Both lines take calls and texts · <a href="mailto:support@partsnow.ai">support@partsnow.ai</a>
          </div>
          <div className="fsocial">
            <a href="https://www.linkedin.com/company/partsnow-ai" target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>
            </a>
            <a href="https://www.facebook.com/1157337360790693" target="_blank" rel="noopener" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z"/></svg>
            </a>
            <a href="https://www.youtube.com/playlist?list=PL3qg78k_nkrfPi1bgleu20Nr4k7MXRUHW" target="_blank" rel="noopener" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4l6.27 3.6L9.6 15.6z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="wrap">
        <div className="fbadges">
          <a href="https://twelve.tools/" target="_blank" rel="noopener">
            <img src="https://twelve.tools/badge3-dark.svg" alt="Featured on Twelve Tools" width={200} height={54} />
          </a>
          <a href="https://turbo0.com/item/partsnowai" target="_blank" rel="noopener noreferrer">
            <img src="https://img.turbo0.com/badge-listed-dark.svg" alt="Listed on Turbo0" style={{ height: 54, width: "auto" }} />
          </a>
          <a href="https://fazier.com/" target="_blank" rel="noopener">
            <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark" width={120} alt="Fazier badge" />
          </a>
          <a href="https://startupfa.me/s/agent.partsnow.ai-763?utm_source=agent.partsnow.ai" target="_blank" rel="noopener">
            <img src="https://startupfa.me/badges/featured/dark-small.webp" alt="PartsNow.ai - Featured on Startup Fame" width={224} height={36} />
          </a>
        </div>
      </div>
      <div className="wrap">
        <div className="fbottom">
          <span>© 2026 PartsNow.ai · An agentic commerce platform by talkrev.ai</span>
          <span>Knoxville, TN</span>
        </div>
      </div>
    </footer>
  );
}
