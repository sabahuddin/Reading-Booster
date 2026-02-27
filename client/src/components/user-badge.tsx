import { getCurrentBadge, getNextBadge, BADGES, type UserBadge as BadgeType } from "@/lib/badges";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sprout, BookOpen, Library, GraduationCap, Star, Crown, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Sprout,
  BookOpen,
  Library,
  GraduationCap,
  Star,
  Crown,
};

function BadgeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

interface UserBadgeDisplayProps {
  points: number;
  compact?: boolean;
}

export function UserBadgeDisplay({ points, compact = false }: UserBadgeDisplayProps) {
  const current = getCurrentBadge(points);
  const next = getNextBadge(points);

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${current.color} text-xs cursor-default`} data-testid="badge-current">
            <BadgeIcon name={current.iconName} className="h-3 w-3 mr-1" />
            {current.name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{points} bodova</p>
          {next && (
            <p className="text-xs flex items-center gap-1">
              Sljedeća: <BadgeIcon name={next.iconName} className="h-3 w-3" /> {next.name} ({next.minPoints} bodova)
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  const progressToNext = next
    ? Math.min(100, ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100)
    : 100;

  return (
    <div className="space-y-3" data-testid="badge-display">
      <div className="flex items-center gap-2">
        <BadgeIcon name={current.iconName} className="h-7 w-7" />
        <div>
          <p className="font-semibold">{current.name}</p>
          <p className="text-xs text-muted-foreground">{points} bodova</p>
        </div>
      </div>
      {next && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BadgeIcon name={current.iconName} className="h-3 w-3" /> {current.name}
            </span>
            <span className="flex items-center gap-1">
              <BadgeIcon name={next.iconName} className="h-3 w-3" /> {next.name} ({next.minPoints})
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Još {next.minPoints - points} bodova do sljedeće značke
          </p>
        </div>
      )}
    </div>
  );
}

interface AllBadgesProps {
  points: number;
}

export function AllBadges({ points }: AllBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="all-badges">
      {BADGES.map((badge: BadgeType) => {
        const isEarned = points >= badge.minPoints;
        return (
          <Tooltip key={badge.name}>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium ${
                  isEarned
                    ? badge.color
                    : "bg-gray-50 text-gray-400 border-gray-200 opacity-50 grayscale"
                }`}
                data-testid={`badge-${badge.name.toLowerCase()}`}
              >
                <BadgeIcon name={badge.iconName} className="h-4 w-4" />
                <span>{badge.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isEarned
                ? `Osvojeno! (${badge.minPoints}+ bodova)`
                : `Potrebno ${badge.minPoints} bodova`}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
