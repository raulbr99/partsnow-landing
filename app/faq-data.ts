export type FaqItem = { q: string; a: string };

// Single source of truth for the FAQ — consumed by the UI (LandingPage)
// and by the FAQPage JSON-LD in app/page.tsx (stripped to plain text).
export const FAQ_ITEMS: FaqItem[] = [
  { q: "Do I have to buy anything?", a: "No. Ask Michael whatever you need and leave. The help is free." },
  { q: "Do I need to make an account?", a: "No account, no sign-up. Open the chat, call, or text and go." },
  { q: "What if I don't know the part name or number?", a: "That's the whole point of Michael. Describe the problem, send a photo, or give a VIN. He figures out the part and tells you where to start." },
  { q: "Can I call or text instead of typing?", a: 'Yes. Chat on the site, call, or text: <a href="tel:+18652905485">(865) 290-5485</a>. The line takes calls and texts, English or Spanish.' },
  { q: "Does Michael speak any other language?", a: 'Yes. Ask in Spanish and he\'ll answer in Spanish — same number: <a href="tel:+18652905485">(865) 290-5485</a>.' },
  { q: "What if I want to order the part?", a: "Michael can pull it from PartsNow.ai, new or OEM, and get it shipped or set up for pickup in Knoxville. Up to you." },
];
