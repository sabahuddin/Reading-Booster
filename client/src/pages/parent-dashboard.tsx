import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Baby, Star, Trophy, GraduationCap, Users } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type ChildUser = Omit<User, "password">;

function ChildCard({ child }: { child: ChildUser }) {
  const { data: results, isLoading: resultsLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", child.id],
  });

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(
        results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes
      )
    : 0;

  return (
    <Card data-testid={`card-child-${child.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg" data-testid={`text-child-name-${child.id}`}>
            {child.fullName}
          </CardTitle>
          <Badge variant="default">
            <Star className="mr-1" />
            {child.points} bodova
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {child.schoolName && (
            <Badge variant="secondary" data-testid={`badge-school-${child.id}`}>
              {child.schoolName}
            </Badge>
          )}
          {child.className && (
            <Badge variant="outline" data-testid={`badge-class-${child.id}`}>
              {child.className}
            </Badge>
          )}
        </div>

        {resultsLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-child-quizzes-${child.id}`}>{totalQuizzes}</p>
              <p className="text-xs text-muted-foreground">Kvizova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-child-score-${child.id}`}>{totalScore}</p>
              <p className="text-xs text-muted-foreground">Bodova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-child-accuracy-${child.id}`}>{avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Točnost</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentDashboard() {
  const { user } = useAuth();

  const { data: children, isLoading } = useQuery<ChildUser[]>({
    queryKey: ["/api/parent/children"],
  });

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-welcome">
            Dobrodošli, {user?.fullName || "Roditelju"}!
          </h1>
          <p className="text-muted-foreground">
            Pratite napredak svoje djece.
          </p>
        </div>

        <Card className="hover-elevate">
          <Link href="/roditelj/djeca" data-testid="link-children-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Baby className="text-muted-foreground" />
                <CardTitle className="text-lg">Djeca</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pogledajte detaljne rezultate i napredak vaše djece.
              </p>
            </CardContent>
          </Link>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !children || children.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Nema povezane djece</p>
              <p className="text-muted-foreground">
                Djeca još nisu povezana s vašim računom. Obratite se administratoru.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
