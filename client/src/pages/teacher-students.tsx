import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Star, Eye, Trophy, Target } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type StudentUser = Omit<User, "password">;

function StudentResultsDialog({
  student,
  open,
  onClose,
}: {
  student: StudentUser;
  open: boolean;
  onClose: () => void;
}) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", student.id],
    enabled: open,
  });

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(
        results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-student-name">
            Rezultati: {student.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-dialog-quizzes">{totalQuizzes}</p>
            <p className="text-xs text-muted-foreground">Kvizova</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-dialog-score">{totalScore}</p>
            <p className="text-xs text-muted-foreground">Bodova</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-dialog-accuracy">{avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Točnost</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !results || results.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Učenik još nema rezultata.</p>
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
      </DialogContent>
    </Dialog>
  );
}

export default function TeacherStudents() {
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  const { data: students, isLoading } = useQuery<StudentUser[]>({
    queryKey: ["/api/teacher/students"],
  });

  const totalStudents = students?.length ?? 0;
  const avgPoints = totalStudents > 0
    ? Math.round(students!.reduce((sum, s) => sum + s.points, 0) / totalStudents)
    : 0;
  const totalPoints = students?.reduce((sum, s) => sum + s.points, 0) ?? 0;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-students-title">Učenici</h1>
          <p className="text-muted-foreground">Upravljajte učenicima i pratite njihov napredak.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno učenika</CardTitle>
              <Users className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-stat-total">{totalStudents}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosječni bodovi</CardTitle>
              <Target className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-stat-avg">{avgPoints}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupni bodovi</CardTitle>
              <Star className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-stat-total-points">{totalPoints}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popis učenika</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !students || students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema učenika u vašem razredu.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id} data-testid={`row-student-${s.id}`}>
                      <TableCell className="font-medium">{s.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{s.username}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <Star className="mr-1" />
                          {s.points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedStudent(s)}
                          data-testid={`button-view-results-${s.id}`}
                        >
                          <Eye />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedStudent && (
          <StudentResultsDialog
            student={selectedStudent}
            open={!!selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
