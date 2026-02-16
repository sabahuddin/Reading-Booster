import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ShoppingCart,
  Brain,
  MapPin,
  Library,
  Eye,
  Info,
  ArrowLeft,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Book, Quiz, QuizResult } from "@shared/schema";
import defaultBookCover from "@assets/background_1771243573729.png";

const GENRES: Record<string, string> = {
  lektira: "Lektira", avantura_fantasy: "Avantura i Fantasy",
  realisticni_roman: "Realistični roman", beletristika: "Beletristika",
  bajke_basne: "Bajke i Basne", zanimljiva_nauka: "Zanimljiva nauka",
  poezija: "Poezija", islam: "Islam",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  lako: "Lako", srednje: "Srednje", tesko: "Teško",
};

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
  const quiz = quizzes?.[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          <Button variant="ghost" asChild data-testid="button-back-library">
            <Link href="/biblioteka">
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
                        {book.ageGroup}
                      </Badge>
                    )}
                    {book.genre && (
                      <Badge variant="outline" data-testid="badge-genre">
                        {GENRES[book.genre] ?? book.genre}
                      </Badge>
                    )}
                    {book.readingDifficulty && (
                      <Badge variant="secondary" data-testid="badge-difficulty">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        {DIFFICULTY_LABELS[book.readingDifficulty] ?? book.readingDifficulty}
                      </Badge>
                    )}
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
                </div>
              </div>

              <Card className="border-2 border-primary" data-testid="card-where-to-find">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="text-primary" />
                    Gdje pronaći ovu knjigu?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {book.availableInLibrary && (
                    <Alert data-testid="alert-library-available">
                      <Library className="h-5 w-5" />
                      <AlertTitle>Dostupno u školskoj biblioteci</AlertTitle>
                      <AlertDescription>
                        {book.locationInLibrary && (
                          <p className="mt-2">
                            <strong>Lokacija:</strong> {book.locationInLibrary}
                          </p>
                        )}
                        {book.copiesAvailable !== undefined && book.copiesAvailable !== null && (
                          <p>
                            <strong>Dostupno primjeraka:</strong> {book.copiesAvailable}
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {book.purchaseUrl && (
                    <Button size="lg" className="w-full" asChild data-testid="button-buy-book">
                      <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2" />
                        Kupi knjigu online
                      </a>
                    </Button>
                  )}

                  {book.pdfUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Možeš pogledati prvih nekoliko stranica:
                      </p>
                      <Button variant="outline" className="w-full" asChild data-testid="button-preview-pdf">
                        <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2" />
                          Pogledaj uzorak knjige (PDF)
                        </a>
                      </Button>
                    </div>
                  )}

                  {!book.availableInLibrary && !book.purchaseUrl && !book.pdfUrl && (
                    <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-availability">
                      Informacije o dostupnosti knjige nisu trenutno dostupne.
                    </p>
                  )}
                </CardContent>
              </Card>

              {isAuthenticated && quiz && (
                <Card data-testid="card-quiz-section">
                  <CardHeader>
                    <CardTitle>Pročitao si knjigu?</CardTitle>
                    <CardDescription>
                      Dokaži svoje znanje i osvoji bodove!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quizzes && quizzes.length > 0 ? (
                      <div className="space-y-3">
                        {quizzes.map((q) => {
                          const taken = takenQuizIds.has(q.id);
                          const result = myResults?.find((r) => r.quizId === q.id);
                          return (
                            <div
                              key={q.id}
                              className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-md border"
                              data-testid={`quiz-row-${q.id}`}
                            >
                              <div>
                                <p className="font-medium">{q.title}</p>
                                {taken && result && (
                                  <p className="text-sm text-muted-foreground">
                                    Rezultat: {result.correctAnswers}/{result.totalQuestions} ({result.score} bodova)
                                  </p>
                                )}
                              </div>
                              {taken ? (
                                <Badge variant="secondary">Riješeno</Badge>
                              ) : (
                                <Link href={`/ucenik/kviz/${q.id}`}>
                                  <Button data-testid={`button-take-quiz-${q.id}`}>
                                    <Brain className="mr-2" />
                                    Rješavaj kviz
                                  </Button>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Za ovu knjigu još nema kvizova.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {!isAuthenticated && (
                <Alert data-testid="alert-login-for-quiz">
                  <Info className="h-5 w-5" />
                  <AlertTitle>Prijavi se za rješavanje kviza</AlertTitle>
                  <AlertDescription>
                    Moraš biti prijavljen da bi mogao rješavati kvizove.
                    <Link href="/prijava">
                      <Button variant="ghost" className="px-1 h-auto ml-1 underline" data-testid="button-login-link">
                        Prijavi se
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <Card data-testid="card-book-details">
                <CardHeader>
                  <CardTitle>Detalji o knjizi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Autor:</strong> {book.author}
                    </div>
                    {book.pageCount && (
                      <div>
                        <strong>Broj stranica:</strong> {book.pageCount}
                      </div>
                    )}
                    {book.publisher && (
                      <div>
                        <strong>Izdavač:</strong> {book.publisher}
                      </div>
                    )}
                    <div>
                      <strong>Godina i mjesto:</strong> {book.publicationYear || "/"} {book.publicationCity ? `, ${book.publicationCity}` : ""}
                    </div>
                    {book.isbn && (
                      <div data-testid="text-book-isbn">
                        <strong>ISBN:</strong> {book.isbn}
                      </div>
                    )}
                    <div data-testid="text-book-cobiss">
                      <strong>COBISS.BH-ID:</strong> {book.cobissId || "/"}
                    </div>
                    {book.readingDifficulty && (
                      <div>
                        <strong>Težina čitanja:</strong> {DIFFICULTY_LABELS[book.readingDifficulty] ?? book.readingDifficulty}
                      </div>
                    )}
                    {book.language && (
                      <div>
                        <strong>Jezik:</strong> {book.language}
                      </div>
                    )}
                    {book.bookFormat && (
                      <div>
                        <strong>Format:</strong> {book.bookFormat}
                      </div>
                    )}
                    {book.recommendedForGrades && book.recommendedForGrades.length > 0 && (
                      <div className="md:col-span-2">
                        <strong>Preporučeno za:</strong> {book.recommendedForGrades.join(', ')} razred
                      </div>
                    )}
                  </div>
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
