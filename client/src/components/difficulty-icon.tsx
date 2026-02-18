import lightImg from "@assets/difficulty_easy_new.png";
import normalImg from "@assets/difficulty_medium_new.png";
import hardImg from "@assets/difficulty_hard_new.png";

const DIFFICULTY_MAP: Record<string, { src: string; label: string }> = {
  lako: { src: lightImg, label: "Lako" },
  srednje: { src: normalImg, label: "Srednje" },
  tesko: { src: hardImg, label: "Teško" },
};

interface DifficultyIconProps {
  difficulty: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZES = {
  sm: "h-6",
  md: "h-7",
  lg: "h-8",
};

export function DifficultyIcon({ difficulty, size = "md", showLabel = false }: DifficultyIconProps) {
  const entry = DIFFICULTY_MAP[difficulty];
  if (!entry) return null;

  return (
    <span className="inline-flex items-center gap-1" data-testid={`difficulty-icon-${difficulty}`} title={entry.label}>
      <img
        src={entry.src}
        alt={entry.label}
        className={`${SIZES[size]} w-auto object-contain`}
      />
      {showLabel && <span className="text-sm text-muted-foreground">{entry.label}</span>}
    </span>
  );
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  lako: "Lako",
  srednje: "Srednje",
  tesko: "Teško",
};
