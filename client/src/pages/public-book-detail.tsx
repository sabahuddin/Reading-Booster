import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, FileText, GraduationCap, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Book, Quiz, QuizResult } from "@shared/schema";

export default function PublicBookDetail() {
  const [, params] = useRoute("/knjiga/:id");
  const bookId = params?.id;
  const { user, isAuthenticated } = useAuth();

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
    enabled: isAuthenticated,
  });

  const takenQuizIds = new Set(myResults?.map((r) => r.quizId) ?? []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          <Button variant="ghost" asChild data-testid="button-back-library">
            <Link href="/biblioteka">
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
                  {book.coverImage ? (
                    <div className="w-48 h-64 rounded-md overflow-hidden bg-muted">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        data-testid="img-book-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-64 rounded-md bg-muted flex items-center justify-center">
                      <BookOpen className="text-muted-foreground" />
                    </div>
                  )}
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
                      <GraduationCap className="mr-1" />
                      {book.gradeLevel}
                    </Badge>
                    <Badge variant="outline">
                      <FileText className="mr-1" />
                      {book.pageCount} stranica
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-book-description">
                    {book.description}
                  </p>
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
                        const taken = isAuthenticated && takenQuizIds.has(quiz.id);
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
                            ) : isAuthenticated ? (
                              <Button asChild data-testid={`button-take-quiz-${quiz.id}`}>
                                <Link href={`/ucenik/kviz/${quiz.id}`}>Riješi kviz</Link>
                              </Button>
                            ) : (
                              <Button asChild data-testid={`button-login-quiz-${quiz.id}`}>
                                <Link href="/prijava">Prijavi se za kviz</Link>
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
      </main>
      <Footer />
    </div>
  );
}
