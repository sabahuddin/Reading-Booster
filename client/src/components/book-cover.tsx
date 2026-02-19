import { BookOpen } from "lucide-react";

const AGE_GROUP_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  R1: { bg: "from-amber-400 to-orange-500", accent: "bg-amber-300/30", text: "text-amber-50" },
  R4: { bg: "from-emerald-400 to-teal-600", accent: "bg-emerald-300/30", text: "text-emerald-50" },
  R7: { bg: "from-blue-400 to-indigo-600", accent: "bg-blue-300/30", text: "text-blue-50" },
  O: { bg: "from-purple-400 to-violet-600", accent: "bg-purple-300/30", text: "text-purple-50" },
  A: { bg: "from-rose-400 to-red-600", accent: "bg-rose-300/30", text: "text-rose-50" },
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

  const colors = AGE_GROUP_COLORS[ageGroup || "R1"] || AGE_GROUP_COLORS.R1;
  const hash = hashString(title + author);
  const patternIndex = hash % PATTERNS.length;
  const pattern = PATTERNS[patternIndex];
  const rotation = (hash % 30) - 15;

  return (
    <div className={`relative h-full w-full rounded-md overflow-hidden bg-gradient-to-br ${colors.bg} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-20"
        style={{ transform: `rotate(${rotation}deg) scale(1.2)` }}
      >
        <path d={pattern} fill="white" />
      </svg>

      <div className={`absolute top-3 left-3 right-3 ${colors.accent} rounded-md p-2`}>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-white/80 shrink-0" />
          <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider truncate">
            {ageGroup || ""}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="space-y-1">
          <h3 className={`font-bold text-sm leading-tight line-clamp-3 ${colors.text} drop-shadow-md`}>
            {title}
          </h3>
          <p className="text-xs text-white/75 line-clamp-1 drop-shadow-sm">
            {author}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
