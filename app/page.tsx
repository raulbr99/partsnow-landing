import { LandingPage } from "@/components/LandingPage";
import { FAQ_ITEMS } from "@/app/faq-data";

const SITE_URL = "https://agent.partsnow.ai";

// Build-time freshness signal — refreshed on every deploy (recency matters for AI search).
const LAST_UPDATED = new Date().toISOString();

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "PartsNow",
      alternateName: "PartsNow.ai",
      url: "https://partsnow.ai",
      logo: `${SITE_URL}/PartsNow-Icon.png`,
      description:
        "AI-powered heavy-duty truck and trailer parts platform. 50,000+ new and OEM parts from trusted dealers, shipped nationwide from Knoxville, TN.",
      sameAs: [
        "https://partsnow.ai",
        "https://www.linkedin.com/company/partsnow-ai",
        "https://www.facebook.com/1157337360790693",
        "https://www.youtube.com/playlist?list=PL3qg78k_nkrfPi1bgleu20Nr4k7MXRUHW",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+1-865-290-5485",
          contactType: "customer support",
          availableLanguage: ["English"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        },
        {
          "@type": "ContactPoint",
          telephone: "+1-865-217-5813",
          contactType: "customer support",
          availableLanguage: ["Spanish"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        },
      ],
    },
    {
      "@type": "AutoPartsStore",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "PartsNow.ai — Ask Mike",
      image: `${SITE_URL}/PartsNow-Icon.png`,
      url: SITE_URL,
      telephone: "+1-865-290-5485",
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Knoxville",
        addressRegion: "TN",
        postalCode: "37921",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 35.9649, longitude: -83.955 },
      areaServed: { "@type": "Country", name: "United States" },
      availableLanguage: ["English", "Spanish"],
      priceRange: "$$",
      description:
        "Talk to Mike, a free AI specialist for heavy-duty truck and trailer parts — by chat, call, or text. Describe a symptom, paste a VIN, or send a photo. English & Spanish, 24/7.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "PartsNow.ai — Ask Mike",
      inLanguage: "en-US",
      dateModified: LAST_UPDATED,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      dateModified: LAST_UPDATED,
      mainEntity: FAQ_ITEMS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: stripHtml(f.a) },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
