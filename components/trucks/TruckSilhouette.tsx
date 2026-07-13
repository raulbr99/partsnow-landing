import type { BodyType } from "@/lib/trucks-data";

// Realistic filled truck silhouettes (side profile, facing left). One detailed
// shape per rig type. viewBox 0 0 254 116, currentColor, evenodd window holes.
// Shared by the interactive explorer and the server-rendered per-truck pages.
const SIL_PATHS = {
  A: '<path fill-rule="evenodd" d="M8 88 L8 54 Q8 50 12 50 L20 50 L24 44 L74 41 L86 22 Q88 18 94 18 L168 18 Q174 18 174 24 L174 84 L246 84 L246 88 Z M92 30 L100 24 L132 24 L132 42 L96 42 Z M140 26 L166 26 L166 44 L140 44 Z"/><rect x="176" y="22" width="4" height="62"/><rect x="182" y="22" width="4" height="62"/><rect x="120" y="64" width="56" height="20" rx="9"/><path d="M30 88 a20 20 0 0 1 40 0 Z"/><circle cx="50" cy="98" r="16"/><circle cx="210" cy="98" r="16"/><circle cx="238" cy="98" r="16"/>',
  B: '<path fill-rule="evenodd" d="M8 88 L8 54 Q8 50 12 50 L20 50 L24 44 L74 41 L86 22 Q88 18 94 18 L138 18 Q144 18 144 24 L144 84 L246 84 L246 88 Z M92 30 L100 24 L138 24 L138 42 L96 42 Z"/><rect x="146" y="22" width="4" height="62"/><path d="M30 88 a20 20 0 0 1 40 0 Z"/><circle cx="50" cy="98" r="16"/><circle cx="208" cy="98" r="16"/><circle cx="236" cy="98" r="16"/>',
  C: '<path fill-rule="evenodd" d="M18 88 L18 30 Q18 22 26 22 L96 22 Q104 22 104 30 L104 84 L210 84 L210 88 Z M26 34 L60 34 L60 58 L26 58 Z M68 34 L96 34 L96 58 L68 58 Z"/><circle cx="52" cy="98" r="16"/><circle cx="176" cy="98" r="16"/>',
  D: '<path fill-rule="evenodd" d="M8 88 L8 56 Q8 52 12 52 L20 52 L24 46 L66 43 L78 24 Q80 20 86 20 L120 20 Q126 20 126 28 L126 84 L130 84 L130 50 L226 44 L240 84 L246 84 L246 88 Z M84 30 L92 26 L120 26 L120 44 L88 44 Z"/><rect x="126" y="24" width="4" height="60"/><path d="M28 88 a20 20 0 0 1 40 0 Z"/><circle cx="48" cy="98" r="16"/><circle cx="170" cy="98" r="16"/><circle cx="198" cy="98" r="16"/>',
  E: '<path fill-rule="evenodd" d="M8 88 L8 56 Q8 52 12 52 L20 52 L24 46 L60 43 L70 28 Q72 24 78 24 L108 24 Q114 24 114 30 L114 36 L240 36 L240 84 L246 84 L246 88 Z M76 32 L84 28 L108 28 L108 44 L80 44 Z"/><path d="M28 88 a20 20 0 0 1 40 0 Z"/><circle cx="48" cy="98" r="16"/><circle cx="204" cy="98" r="16"/>',
} as const;

export function silKey(body: BodyType): keyof typeof SIL_PATHS {
  switch (body) {
    case "Day Cab": return "B";
    case "Cabover":
    case "Electric":
    case "Yard / Terminal": return "C";
    case "Vocational":
    case "Severe-Duty":
    case "Refuse": return "D";
    case "Medium-Duty": return "E";
    default: return "A"; // Sleeper, Heavy-Haul
  }
}

export function TruckSilhouette({ bodyType, className = "" }: { bodyType: BodyType; className?: string }) {
  return (
    <svg
      viewBox="0 0 254 116"
      className={className}
      fill="currentColor"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: SIL_PATHS[silKey(bodyType)] }}
    />
  );
}
