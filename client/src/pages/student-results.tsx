import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Trophy, Star } from "lucide-react";
import type { QuizResult } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function StudentResults() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const dashboardRole = isReader ? "reader" : "student";

  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/my"],
  });

  const totalPoints = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;

  return (
    <DashboardLayout role={dashboardRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-results-title">Moji rezultati</h1>
          <p className="text-muted-foreground">Pregled svih riješenih kvizova.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-lg">Ukupno bodova</CardTitle>
            <Star className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <div className="text-4xl font-bold" data-testid="text-total-points">
                {user?.points ?? totalPoints}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Svi rezultati</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !results || results.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Nema rezultata</p>
                <p className="text-muted-foreground">Još nisi riješio/la nijedan kviz.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kviz</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Točno</TableHead>
                    <TableHead>Netočno</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                      <TableCell className="font-medium">{r.quizId}</TableCell>
                      <TableCell>
                        <Badge variant="default">{r.score}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge>
                      </TableCell>
                      <TableCell>{r.wrongAnswers}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.completedAt
                          ? new Date(r.completedAt).toLocaleDateString("hr-HR")
                          : "-"}
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
