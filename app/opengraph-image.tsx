import { ImageResponse } from "next/og";

export const alt = "Ask Michael — free AI truck parts specialist at PartsNow.ai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0b1020 0%, #14233a 55%, #0b1020 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, letterSpacing: 4, color: "#30d158", fontWeight: 700 }}>
          PARTSNOW.AI
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 86, fontWeight: 800, lineHeight: 1.05 }}>
            Truck down? Ask Michael.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 38, color: "#c7d2e0", fontWeight: 500 }}>
            Free AI specialist for heavy-duty truck &amp; trailer parts.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, color: "#9fb0c3" }}>
          Chat · Call · Text&nbsp;&nbsp;<span style={{ color: "#30d158", fontWeight: 700 }}>(865) 290-5485</span>&nbsp;&nbsp;· English &amp; Spanish · Knoxville, TN
        </div>
      </div>
    ),
    { ...size }
  );
}
