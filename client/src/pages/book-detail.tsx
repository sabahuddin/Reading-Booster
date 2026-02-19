import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Brain,
  ArrowLeft,
  FileText,
  Users,
} from "lucide-react";
import type { Book, Quiz, QuizResult, Genre } from "@shared/schema";
import defaultBookCover from "@assets/background_1771243573729.png";

type BookWithGenres = Book & { genres?: Genre[] };

const AGE_LABELS: Record<string, string> = { R1: "Od 1. razreda", R4: "Od 4. razreda", R7: "Od 7. razreda", O: "Omladina", A: "Odrasli" };


export default function BookDetail() {
  const [, params] = useRoute("/ucenik/knjiga/:id");
  const bookId = params?.id;

  const { data: book, isLoading: bookLoading } = useQuery<BookWithGenres>({
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
  const quiz = quizzes?.[0];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" asChild data-testid="button-back-library">
          <Link href="/ucenik/biblioteka">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad na biblioteku
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
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={book.coverImage || defaultBookCover}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  data-testid="img-book-cover"
                />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-book-title">
                  {book.title}
                </h1>
                <p className="text-xl text-muted-foreground" data-testid="text-book-author">
                  {book.author}
                </p>
                <div className="flex flex-wrap gap-2">
                  {book.ageGroup && (
                    <Badge data-testid="badge-age-group">
                      <Users className="mr-1 h-3 w-3" />
                      {AGE_LABELS[book.ageGroup] || book.ageGroup}
                    </Badge>
                  )}
                  {book.genres && book.genres.length > 0
                    ? book.genres.map(g => <Badge key={g.id} variant="outline" data-testid={`badge-genre-${g.slug}`}>{g.name}</Badge>)
                    : book.genre && <Badge variant="outline" data-testid="badge-genre">{book.genre}</Badge>
                  }
                  {book.pageCount && (
                    <Badge variant="outline">
                      <FileText className="mr-1 h-3 w-3" />
                      {book.pageCount} stranica
                    </Badge>
                  )}
                </div>
                {book.description && (
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-book-description">
                    {book.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground italic" data-testid="text-find-book">
                  Knjigu potražite u školskoj ili gradskoj biblioteci.
                </p>
              </div>
            </div>

            {quiz && (
              <Card data-testid="card-quiz-section">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Kviz za ovu knjigu
                  </h3>
                  {takenQuizIds.has(quiz.id) ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Već si riješio/la kviz za ovu knjigu.</p>
                      <Button variant="outline" asChild data-testid="button-view-results">
                        <Link href="/ucenik/rezultati">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Pogledaj rezultate
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        Pročitao/la si knjigu? Testiraj svoje znanje i osvoji bodove!
                      </p>
                      <Button asChild data-testid="button-start-quiz">
                        <Link href={`/ucenik/kviz/${quiz.id}`}>
                          <Brain className="mr-2 h-4 w-4" />
                          Pokreni kviz
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
