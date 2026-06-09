export type FaqItem = { q: string; a: string };

// Single source of truth for the FAQ — consumed by the UI (LandingPage)
// and by the FAQPage JSON-LD in app/page.tsx (stripped to plain text).
export const FAQ_ITEMS: FaqItem[] = [
  { q: "Do I have to buy anything?", a: "No. Ask Mike whatever you need and leave. The help is free." },
  { q: "Do I need to make an account?", a: "No account, no sign-up. Open the chat, call, or text and go." },
  { q: "What if I don't know the part name or number?", a: "That's the whole point of Mike. Describe the problem, send a photo, or give a VIN. He figures out the part and tells you where to start." },
  { q: "Can I call or text instead of typing?", a: 'Yes. Chat on the site, call, or text. English: <a href="tel:+18652905485">(865) 290-5485</a>. Español: <a href="tel:+18652175813">(865) 217-5813</a>. Both lines take calls and texts.' },
  { q: "Does Mike speak any other language?", a: 'Yes. Ask in Spanish and he\'ll answer in Spanish. The Spanish line is <a href="tel:+18652175813">(865) 217-5813</a>.' },
  { q: "What if I want to order the part?", a: "Mike can pull it from PartsNow.ai, new or OEM, and get it shipped or set up for pickup in Knoxville. Up to you." },
  { q: "How do I find a truck part without the part number?", a: "Just describe the problem to Mike in plain words, or send a photo or your VIN. He identifies the right part for you — no part number or technical terms needed." },
  { q: "Can Mike identify a truck part from a photo?", a: "Yes. Snap a photo of the old part — even with no number stamped on it — and Mike matches it to the right replacement." },
  { q: "Where can I buy heavy-duty truck parts online?", a: "At PartsNow.ai: 50,000+ new and OEM parts from trusted dealers, shipped nationwide from Knoxville, TN, with free local pickup. Mike can order it for you right from the chat." },
  { q: "What trucks and trailers does Mike cover?", a: "All heavy-duty makes — Freightliner, Peterbilt, Kenworth, Mack, Volvo, and International — across brakes & wheel end, air system, electrical, engine, filtration, driveline, hydraulics, and trailer parts." },
  { q: "How fast can I get an answer?", a: 'About a minute. Open the chat, call, or text <a href="tel:+18652905485">(865) 290-5485</a> any hour — Mike answers 24/7 in English or Spanish.' },
];
