import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
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

            <Card data-testid="card-book-details">
              <CardHeader>
                <CardTitle>Detalji o knjizi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Autor:</strong> {book.author}
                  </div>
                  {book.pageCount && (
                    <div>
                      <strong>Broj stranica:</strong> {book.pageCount}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div data-testid="text-book-publisher">
                      <strong>Izdavač i jezik:</strong> {book.publisher || "/"}, {book.language || "/"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div data-testid="text-book-isbn">
                      <strong>ISBN:</strong> {book.isbn || "/"}
                    </div>
                    <div data-testid="text-book-cobiss">
                      <strong>COBISS.BH-ID:</strong> {book.cobissId || "/"}
                    </div>
                  </div>
                  {book.readingDifficulty && (
                    <div>
                      <strong>Težina čitanja:</strong> {DIFFICULTY_LABELS[book.readingDifficulty] ?? book.readingDifficulty}
                    </div>
                  )}
                  {book.publicationYear && (
                    <div>
                      <strong>Godina izdanja:</strong> {book.publicationYear}
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

                <div className="pt-6 border-t space-y-4" data-testid="card-where-to-find">
                  <h3 className="font-bold text-lg">Gdje pronaći ovu knjigu?</h3>
                  <p className="text-muted-foreground">
                    Knjigu potražite u vašoj školskoj ili gradskoj biblioteci.
                  </p>
                  
                  {book.purchaseUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <p className="text-sm">Za kupovinu knjige kontaktirajte našeg partnera:</p>
                      <Button size="sm" asChild data-testid="button-buy-book">
                        <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Kupi
                        </a>
                      </Button>
                    </div>
                  )}

                  {book.pdfUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        Možeš pogledati prvih nekoliko stranica:
                      </p>
                      <Button variant="outline" size="sm" asChild data-testid="button-preview-pdf">
                        <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-4 w-4" />
                          Pogledaj uzorak (PDF)
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
