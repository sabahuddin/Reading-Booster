import lightImg from "@assets/light_1_1771376256456.png";
import normalImg from "@assets/normal_2_1771376256456.png";
import hardImg from "@assets/hard_3_1771376256456.png";

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
  md: "h-8",
  lg: "h-10",
};

export function DifficultyIcon({ difficulty, size = "md", showLabel = true }: DifficultyIconProps) {
  const entry = DIFFICULTY_MAP[difficulty];
  if (!entry) return null;

  return (
    <span className="inline-flex items-center gap-1.5" data-testid={`difficulty-icon-${difficulty}`}>
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
