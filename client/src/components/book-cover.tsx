import { BookOpen } from "lucide-react";

const AGE_GROUP_STYLES: Record<string, { gradientFrom: string; gradientTo: string; accentBg: string }> = {
  R1: { gradientFrom: "#fbbf24", gradientTo: "#f97316", accentBg: "rgba(252,211,77,0.3)" },
  R4: { gradientFrom: "#34d399", gradientTo: "#0d9488", accentBg: "rgba(110,231,183,0.3)" },
  R7: { gradientFrom: "#60a5fa", gradientTo: "#4f46e5", accentBg: "rgba(147,197,253,0.3)" },
  O: { gradientFrom: "#c084fc", gradientTo: "#7c3aed", accentBg: "rgba(192,132,252,0.3)" },
  A: { gradientFrom: "#fb7185", gradientTo: "#dc2626", accentBg: "rgba(253,164,175,0.3)" },
};

const PATTERNS = [
  "M0,0 Q25,20 50,0 T100,0 L100,100 L0,100 Z",
  "M0,50 Q25,0 50,50 T100,50 L100,100 L0,100 Z",
  "M0,100 L50,60 L100,100 Z",
  "M0,0 L100,0 L100,40 Q50,80 0,40 Z",
  "M0,0 L100,0 L100,100 Q50,60 0,100 Z",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.includes("placehold.co")) return true;
  if (url.includes("placeholder")) return true;
  if (url.includes("book-placeholder")) return true;
  return false;
}

interface BookCoverProps {
  title: string;
  author: string;
  ageGroup?: string | null;
  coverImage?: string | null;
  className?: string;
}

export function BookCover({ title, author, ageGroup, coverImage, className = "" }: BookCoverProps) {
  if (coverImage && !isPlaceholderImage(coverImage)) {
    return (
      <img
        src={coverImage}
        alt={title}
        className={`h-full w-full object-cover rounded-md ${className}`}
      />
    );
  }

  const colors = AGE_GROUP_STYLES[ageGroup || "R1"] || AGE_GROUP_STYLES.R1;
  const hash = hashString(title + author);
  const patternIndex = hash % PATTERNS.length;
  const pattern = PATTERNS[patternIndex];
  const rotation = (hash % 30) - 15;

  return (
    <div
      className={`relative h-full w-full rounded-md overflow-hidden ${className}`}
      style={{ background: `linear-gradient(to bottom right, ${colors.gradientFrom}, ${colors.gradientTo})` }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-20"
        style={{ transform: `rotate(${rotation}deg) scale(1.2)` }}
      >
        <path d={pattern} fill="white" />
      </svg>

      <div
        className="absolute top-3 left-3 right-3 rounded-md p-2"
        style={{ backgroundColor: colors.accentBg }}
      >
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.8)" }} />
          <span className="text-[10px] font-medium uppercase tracking-wider truncate" style={{ color: "rgba(255,255,255,0.8)" }}>
            {ageGroup || ""}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm leading-tight line-clamp-3 drop-shadow-md" style={{ color: "rgba(255,255,255,0.95)" }}>
            {title}
          </h3>
          <p className="text-xs line-clamp-1 drop-shadow-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            {author}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}
      />
    </div>
  );
}
