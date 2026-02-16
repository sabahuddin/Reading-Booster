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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Star, Trophy, Users, GraduationCap } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type ChildUser = Omit<User, "password">;

function ChildDetailTab({ child }: { child: ChildUser }) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg" data-testid={`text-child-detail-name-${child.id}`}>
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
              <Badge variant="secondary">
                <GraduationCap className="mr-1" />
                {child.schoolName}
              </Badge>
            )}
            {child.className && (
              <Badge variant="outline">{child.className}</Badge>
            )}
            <Badge variant="outline">{child.username}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-detail-quizzes-${child.id}`}>{totalQuizzes}</p>
              <p className="text-xs text-muted-foreground">Kvizova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-detail-score-${child.id}`}>{totalScore}</p>
              <p className="text-xs text-muted-foreground">Bodova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-detail-accuracy-${child.id}`}>{avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Točnost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rezultati kvizova</CardTitle>
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
              <p className="text-muted-foreground">Dijete još nema rezultata kvizova.</p>
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
                {results.map((r) => (
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
  );
}

export default function ParentChildren() {
  const { data: children, isLoading } = useQuery<ChildUser[]>({
    queryKey: ["/api/parent/children"],
  });

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-children-title">Djeca</h1>
          <p className="text-muted-foreground">Detaljni pregled napretka vaše djece.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
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
        ) : children.length === 1 ? (
          <ChildDetailTab child={children[0]} />
        ) : (
          <Tabs defaultValue={children[0].id} className="space-y-4">
            <TabsList className="flex-wrap">
              {children.map((child) => (
                <TabsTrigger
                  key={child.id}
                  value={child.id}
                  data-testid={`tab-child-${child.id}`}
                >
                  <Baby className="mr-1" />
                  {child.fullName}
                </TabsTrigger>
              ))}
            </TabsList>
            {children.map((child) => (
              <TabsContent key={child.id} value={child.id}>
                <ChildDetailTab child={child} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
