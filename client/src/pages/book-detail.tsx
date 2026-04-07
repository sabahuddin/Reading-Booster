import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
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
  Globe,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { SocialShare } from "@/components/social-share";
import { BookRating } from "@/components/book-rating";
import { PdfViewer } from "@/components/pdf-viewer";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { Book, Quiz, QuizResult, Genre } from "@shared/schema";
import { BookCover } from "@/components/book-cover";
import { AgeGroupBadge } from "@/components/age-group-badge";

type BookWithGenres = Book & { genres?: Genre[] };


export default function BookDetail() {
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const basePath = isReader ? "/citanje" : "/ucenik";
  const dashboardRole = isReader ? "reader" : "student" as const;
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [, studentParams] = useRoute("/ucenik/knjiga/:id");
  const [, readerParams] = useRoute("/citanje/knjiga/:id");
  const bookId = studentParams?.id || readerParams?.id;

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

  const { data: allBookmarks = [] } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
    enabled: isAuthenticated,
  });

  const isBookmarked = bookId ? allBookmarks.some((bm: any) => bm.bookId === bookId) : false;

  const toggleBookmark = useMutation({
    mutationFn: () => isBookmarked
      ? apiRequest("DELETE", `/api/bookmarks/${bookId}`)
      : apiRequest("POST", `/api/bookmarks/${bookId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/bookmarks"] }),
  });

  const takenQuizIds = new Set(myResults?.map((r) => r.quizId) ?? []);
  const quiz = quizzes?.[0];

  return (
    <DashboardLayout role={dashboardRole}>
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" asChild data-testid="button-back-library">
          <Link href={`${basePath}/biblioteka`}>
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
              <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-muted shadow-lg" data-testid="img-book-cover">
                <BookCover title={book.title} author={book.author} ageGroup={book.ageGroup} coverImage={book.coverImage} />
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
                    <AgeGroupBadge ageGroup={book.ageGroup} showIcon />
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
                  {book.language && (
                    <Badge variant="outline" data-testid="badge-language">
                      <Globe className="mr-1 h-3 w-3" />
                      {book.language}
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
                <BookRating bookId={book.id} isAuthenticated={isAuthenticated} />
                <div className="flex items-center gap-3">
                  {isAuthenticated && (
                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleBookmark.mutate()}
                      disabled={toggleBookmark.isPending}
                      className="gap-2"
                      data-testid="button-toggle-bookmark"
                    >
                      {isBookmarked ? (
                        <><BookmarkCheck className="h-4 w-4" /> Označena</>
                      ) : (
                        <><Bookmark className="h-4 w-4" /> Označi</>
                      )}
                    </Button>
                  )}
                  <SocialShare title={`${book.title} - ${book.author}`} url={`https://citanje.ba/knjiga/${book.id}`} compact />
                </div>
              </div>
            </div>

            {book.pdfUrl && (
              <PdfViewer url={book.pdfUrl} title={book.title} />
            )}

            {quiz && (
              <Card data-testid="card-quiz-section">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Kviz za ovu knjigu
                  </h3>
                  {quiz.approvedTeacherName && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2" data-testid="text-quiz-approved-teacher">
                      <Brain className="h-4 w-4 shrink-0" />
                      Kviz odobrio/la: <span className="font-semibold">{quiz.approvedTeacherName}</span>
                    </p>
                  )}
                  {takenQuizIds.has(quiz.id) ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Već si riješio/la kviz za ovu knjigu.</p>
                      <Button variant="outline" asChild data-testid="button-view-results">
                        <Link href={`${basePath}/rezultati`}>
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
                        <Link href={`${basePath}/kviz/${quiz.id}`}>
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
