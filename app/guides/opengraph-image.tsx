import { ImageResponse } from "next/og";

export const alt = "PartsNow Truck Guides — practical repair and how-to guides for heavy-duty trucks";
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
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0b1020 0%, #14233a 55%, #0b1020 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* radial glow, top-left */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: -140,
            top: -180,
            width: 640,
            height: 640,
            background: "radial-gradient(circle, rgba(64,134,150,0.40), transparent 70%)",
          }}
        />
        {/* concentric "gauge" rings, bottom-right */}
        <div style={{ position: "absolute", display: "flex", right: -190, bottom: -190, width: 560, height: 560, borderRadius: "50%", border: "2px solid rgba(64,134,150,0.30)" }} />
        <div style={{ position: "absolute", display: "flex", right: -110, bottom: -110, width: 400, height: 400, borderRadius: "50%", border: "2px solid rgba(48,209,88,0.22)" }} />
        <div style={{ position: "absolute", display: "flex", right: -30, bottom: -30, width: 240, height: 240, borderRadius: "50%", border: "3px solid rgba(240,121,34,0.45)" }} />

        {/* content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            zIndex: 2,
            maxWidth: 980,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, letterSpacing: 6, color: "#30d158", fontWeight: 700, marginBottom: 30 }}>
            PARTSNOW.AI · TRUCK GUIDES
          </div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.0, letterSpacing: -3 }}>
            Fix it right the first time.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 36, color: "#c7d2e0", fontWeight: 500, lineHeight: 1.3, maxWidth: 860 }}>
            Practical repair &amp; how-to guides for heavy-duty trucks. New guide every day.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 46 }}>
            <div style={{ display: "flex", alignItems: "center", background: "#f07922", color: "#ffffff", fontSize: 28, fontWeight: 700, padding: "15px 30px", borderRadius: 9999 }}>
              Read the guides
            </div>
            <div style={{ display: "flex", alignItems: "center", marginLeft: 22, fontSize: 30, color: "#ffffff", fontWeight: 700 }}>
              agent.partsnow.ai/guides
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 25, color: "#9fb0c3" }}>
            Written for the people who turn the wrenches · Free · English &amp; Spanish help
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
