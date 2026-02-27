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
import { Trophy, Star, BookOpen, CheckCircle, XCircle } from "lucide-react";
import type { QuizResult, Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BookCover } from "@/components/book-cover";

type BookWithQuiz = Book & { quizScore: number; quizDate: string };

export default function StudentResults() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const dashboardRole = isReader ? "reader" : "student";

  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/my"],
  });

  const { data: booksRead, isLoading: booksLoading } = useQuery<BookWithQuiz[]>({
    queryKey: ["/api/quiz-results/my/books"],
  });

  const totalPoints = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;

  return (
    <DashboardLayout role={dashboardRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-results-title">Moji rezultati</h1>
          <p className="text-muted-foreground">Pregled svih riješenih kvizova i pročitanih knjiga.</p>
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
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Knjige koje sam pročitao/la
            </CardTitle>
            <Badge variant="secondary">{booksRead?.length ?? 0}</Badge>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                ))}
              </div>
            ) : !booksRead || booksRead.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Još nema pročitanih knjiga. Položi kviz sa 50%+ tačnih odgovora!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {booksRead.map((book) => (
                  <div key={book.id} className="space-y-2" data-testid={`book-read-${book.id}`}>
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden border">
                      <BookCover
                        title={book.title}
                        author={book.author}
                        coverImage={book.coverImage}
                        ageGroup={book.ageGroup}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium line-clamp-2">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.quizScore} bodova</p>
                    </div>
                  </div>
                ))}
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
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => {
                    const pct = r.totalQuestions > 0 ? Math.round((r.correctAnswers / r.totalQuestions) * 100) : 0;
                    const passed = pct >= 50;
                    return (
                      <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                        <TableCell className="font-medium">{r.quizId.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant={passed ? "default" : "destructive"}>{r.score}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge>
                        </TableCell>
                        <TableCell>
                          {passed ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" /> Položen
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-500 border-red-300">
                              <XCircle className="h-3 w-3 mr-1" /> Pao
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.completedAt
                            ? new Date(r.completedAt).toLocaleDateString("hr-HR")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
