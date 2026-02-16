import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, BookOpen, Trophy, Target, TrendingUp } from "lucide-react";
import type { QuizResult } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/my"],
  });

  const totalQuizzes = results?.length ?? 0;
  const totalPoints = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgScore = totalQuizzes > 0
    ? Math.round((results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0)) / totalQuizzes)
    : 0;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-welcome">
            Dobrodošli, {user?.fullName || "Učeniče"}!
          </h1>
          <p className="text-muted-foreground">
            Nastavi čitati i osvajaj bodove.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno bodova</CardTitle>
              <Star className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-points">
                  {user?.points ?? totalPoints}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kvizova riješeno</CardTitle>
              <Target className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-quizzes">
                  {totalQuizzes}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosječna točnost</CardTitle>
              <TrendingUp className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-avg-score">
                  {avgScore}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover-elevate">
            <Link href="/ucenik/biblioteka" data-testid="link-library-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="text-muted-foreground" />
                  <CardTitle className="text-lg">Biblioteka</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pregledaj knjige i počni čitati novu avanturu.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover-elevate">
            <Link href="/ucenik/rezultati" data-testid="link-results-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="text-muted-foreground" />
                  <CardTitle className="text-lg">Moji rezultati</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pogledaj sve svoje kvizove i postignuća.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nedavni rezultati</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !results || results.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Još nemaš rezultata.</p>
                <Button asChild className="mt-4" data-testid="link-start-reading">
                  <Link href="/ucenik/biblioteka">Počni čitati</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kviz</TableHead>
                    <TableHead>Točno</TableHead>
                    <TableHead>Netočno</TableHead>
                    <TableHead>Bodovi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 5).map((r) => (
                    <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                      <TableCell className="font-medium">{r.quizId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge>
                      </TableCell>
                      <TableCell>{r.wrongAnswers}</TableCell>
                      <TableCell>
                        <Badge variant="default">{r.score}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
