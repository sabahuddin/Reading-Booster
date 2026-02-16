import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, FileText, CheckCircle, ShoppingCart, Download, Users, BarChart3 } from "lucide-react";
import type { Book, Quiz, QuizResult } from "@shared/schema";
import defaultBookCover from "@assets/background_1771243573729.png";

const GENRES: Record<string, string> = {
  bajke: "Bajke i priče", avantura: "Avantura", fantazija: "Fantazija",
  roman: "Roman", poezija: "Poezija", nauka: "Nauka i znanje",
  historija: "Historija", biografija: "Biografija", humor: "Humor",
  misterija: "Misterija", drama: "Drama", ostalo: "Ostalo",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  lako: "Lako", srednje: "Srednje", tesko: "Teško",
};

export default function BookDetail() {
  const [, params] = useRoute("/ucenik/knjiga/:id");
  const bookId = params?.id;

  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ["/api/books", bookId],
    enabled: !!bookId,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/books", bookId, "quizzes"],
    enabled: !!bookId,
  });

  const { data: myResults } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/my"],
  });

  const takenQuizIds = new Set(myResults?.map((r) => r.quizId) ?? []);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" asChild data-testid="button-back-library">
          <Link href="/ucenik/biblioteka">
            <ArrowLeft />
            <span>Natrag u biblioteku</span>
          </Link>
        </Button>

        {bookLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !book ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Knjiga nije pronađena</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="w-48 h-64 rounded-md overflow-hidden bg-muted">
                  <img
                    src={book.coverImage || defaultBookCover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    data-testid="img-book-cover"
                  />
                </div>
              </div>
              <div className="space-y-3 flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-book-title">
                  {book.title}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="text-book-author">
                  {book.author}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {book.ageGroup} god.
                  </Badge>
                  <Badge variant="secondary">
                    {GENRES[book.genre] ?? book.genre}
                  </Badge>
                  <Badge variant="outline">
                    <BarChart3 className="mr-1 h-3 w-3" />
                    {DIFFICULTY_LABELS[book.readingDifficulty] ?? book.readingDifficulty}
                  </Badge>
                  <Badge variant="outline">
                    <FileText className="mr-1 h-3 w-3" />
                    {book.pageCount} stranica
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-book-description">
                  {book.description}
                </p>
                <div className="flex items-center gap-3 flex-wrap pt-2">
                  {book.purchaseUrl && (
                    <Button asChild data-testid="button-buy-book">
                      <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Kupi knjigu
                      </a>
                    </Button>
                  )}
                  {book.pdfUrl && (
                    <Button variant="outline" asChild data-testid="button-download-pdf">
                      <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Čitaj online
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {book.content && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sadržaj knjige</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
                    data-testid="text-book-content"
                  >
                    {book.content}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kvizovi</CardTitle>
              </CardHeader>
              <CardContent>
                {quizzesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !quizzes || quizzes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Za ovu knjigu još nema kvizova.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map((quiz) => {
                      const taken = takenQuizIds.has(quiz.id);
                      const result = myResults?.find((r) => r.quizId === quiz.id);
                      return (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-md border"
                          data-testid={`quiz-row-${quiz.id}`}
                        >
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            {taken && result && (
                              <p className="text-sm text-muted-foreground">
                                Rezultat: {result.correctAnswers}/{result.totalQuestions} ({result.score} bodova)
                              </p>
                            )}
                          </div>
                          {taken ? (
                            <Badge variant="secondary">
                              <CheckCircle className="mr-1" />
                              Riješeno
                            </Badge>
                          ) : (
                            <Button asChild data-testid={`button-take-quiz-${quiz.id}`}>
                              <Link href={`/ucenik/kviz/${quiz.id}`}>Riješi kviz</Link>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
