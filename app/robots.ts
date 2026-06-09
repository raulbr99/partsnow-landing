import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      // Explicitly welcome AI answer engines / crawlers (June 2026)
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "Meta-ExternalAgent",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://agent.partsnow.ai/sitemap.xml",
    host: "https://agent.partsnow.ai",
  };
}
