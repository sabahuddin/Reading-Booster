import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const AGE_GROUP_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; description: string }> = {
  R1: { label: "R1", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", description: "6-9 god." },
  R4: { label: "R4", bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-400", description: "10-12 god." },
  R7: { label: "R7", bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-400", description: "13-15 god." },
  O:  { label: "O",  bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-400", description: "15-18 god." },
  A:  { label: "A",  bg: "bg-red-100", text: "text-red-800", border: "border-red-300", description: "18+" },
};

export const AGE_LABELS: Record<string, string> = {
  R1: "Od 1. razreda",
  R4: "Od 4. razreda",
  R7: "Od 7. razreda",
  O: "Omladina",
  A: "Odrasli",
};

interface AgeGroupBadgeProps {
  ageGroup: string;
  showIcon?: boolean;
  showDescription?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function AgeGroupBadge({ ageGroup, showIcon = false, showDescription = false, size = "md", className = "" }: AgeGroupBadgeProps) {
  const config = AGE_GROUP_CONFIG[ageGroup];
  if (!config) {
    return <Badge variant="secondary" className={className}>{ageGroup}</Badge>;
  }

  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5";

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} border font-bold ${sizeClasses} ${className}`}
      data-testid="badge-age-group"
    >
      {showIcon && <Users className="mr-1 h-3 w-3" />}
      {config.label}
      {showDescription && <span className="ml-1 font-normal opacity-75">{config.description}</span>}
    </Badge>
  );
}

export function AgeGroupDot({ ageGroup }: { ageGroup: string }) {
  const dotColors: Record<string, string> = {
    R1: "bg-amber-400",
    R4: "bg-lime-500",
    R7: "bg-sky-500",
    O: "bg-purple-500",
    A: "bg-red-500",
  };

  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColors[ageGroup] || "bg-gray-400"}`} title={AGE_LABELS[ageGroup] || ageGroup} />;
}
