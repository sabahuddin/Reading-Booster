import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Baby, Star, Trophy, Users, Target, TrendingUp, BookOpen } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type ChildUser = Omit<User, "password">;

function ChildSummaryCard({ child }: { child: ChildUser }) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", child.id],
  });

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes)
    : 0;

  const recentResults = results?.slice(0, 3) ?? [];

  return (
    <Card data-testid={`card-child-${child.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Baby className="text-muted-foreground" />
            <CardTitle className="text-lg" data-testid={`text-child-name-${child.id}`}>
              {child.fullName}
            </CardTitle>
          </div>
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
          {child.ageGroup && (
            <Badge variant="outline">Grupa: {child.ageGroup}</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
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
              <p className="text-xs text-muted-foreground">Tačnost</p>
            </div>
          </div>
        )}

        {recentResults.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 text-muted-foreground">Nedavni kvizovi:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kviz</TableHead>
                  <TableHead>Tačno</TableHead>
                  <TableHead>Bodovi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResults.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.quizId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{r.score}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

  const totalChildPoints = children?.reduce((sum, c) => sum + c.points, 0) ?? 0;
  const totalChildren = children?.length ?? 0;

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-welcome">
            Dobrodošli, {user?.fullName || "Roditelju"}!
          </h1>
          <p className="text-muted-foreground">
            Pratite napredak i rezultate svoje djece.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Djece</CardTitle>
              <Baby className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-total-children">{totalChildren}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno bodova</CardTitle>
              <Star className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-total-points">{totalChildPoints}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vaši bodovi</CardTitle>
              <Trophy className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-parent-points">{user?.points ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Porodično takmičenje</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover-elevate">
            <Link href="/roditelj/djeca" data-testid="link-children-detail">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Baby className="text-muted-foreground" />
                  <CardTitle className="text-lg">Detalji o djeci</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Detaljni pregled rezultata i napretka vaše djece.
                </p>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover-elevate">
            <Link href="/biblioteka" data-testid="link-library">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="text-muted-foreground" />
                  <CardTitle className="text-lg">Biblioteka</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pregledajte knjige dostupne vašoj djeci.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((j) => <Skeleton key={j} className="h-16 w-full" />)}
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pregled djece</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <ChildSummaryCard key={child.id} child={child} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
