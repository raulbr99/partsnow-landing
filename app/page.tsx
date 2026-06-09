import { LandingPage } from "@/components/LandingPage";
import { FAQ_ITEMS } from "@/app/faq-data";

const SITE_URL = "https://agent.partsnow.ai";

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
      sameAs: ["https://partsnow.ai"],
    },
    {
      "@type": "AutoPartsStore",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "PartsNow.ai — Ask Michael",
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
        "Talk to Michael, a free AI specialist for heavy-duty truck and trailer parts — by chat, call, or text. Describe a symptom, paste a VIN, or send a photo. English & Spanish, 24/7.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "PartsNow.ai — Ask Michael",
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
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
