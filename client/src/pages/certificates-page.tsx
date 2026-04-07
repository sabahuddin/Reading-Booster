import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, BookOpen, Star, Printer, CheckCircle2 } from "lucide-react";
import type { QuizResult } from "@shared/schema";
import { useLocation } from "wouter";

interface QuizResultWithBook extends QuizResult {
  bookTitle?: string;
  bookAuthor?: string;
}

const AGE_GROUP_LABELS: Record<string, string> = {
  R1: "Razred 1–3",
  R4: "Razred 4–6",
  R7: "Razred 7–9",
  O: "Omladina",
  A: "Odrasli",
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const dashboardRole = isReader ? "reader" : "student";

  const { data: results, isLoading } = useQuery<QuizResultWithBook[]>({
    queryKey: ["/api/quiz-results/my"],
  });

  const passed = results?.filter((r) => r.passed) ?? [];

  const handlePrint = () => window.print();

  return (
    <DashboardLayout role={dashboardRole}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-certs-title">
              <Award className="text-primary h-7 w-7" />
              Moji sertifikati
            </h1>
            <p className="text-muted-foreground mt-1">
              Svaki položeni kviz donosi ti sertifikat o pročitanoj knjizi.
            </p>
          </div>
          {passed.length > 0 && (
            <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print-certs">
              <Printer className="h-4 w-4 mr-2" />
              Printaj sve
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : passed.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Još nemaš sertifikata</p>
            <p className="text-muted-foreground mt-1">
              Pročitaj knjigu i položi kviz da dobiješ prvi sertifikat!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
            {passed.map((result) => {
              const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
              const dateStr = new Date(result.completedAt).toLocaleDateString("hr-HR");
              return (
                <Card
                  key={result.id}
                  className="border-2 border-primary/30 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20 relative overflow-hidden"
                  data-testid={`cert-${result.id}`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <Award className="w-full h-full text-primary" />
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/30" variant="outline">
                        Položeno ✓
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sertifikat o čitanju</p>
                      <h3 className="font-bold text-base leading-tight line-clamp-2" data-testid={`cert-title-${result.id}`}>
                        {result.bookTitle ?? "Knjiga"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{user?.fullName}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{result.score} bodova</span>
                      </div>
                      <span className="text-muted-foreground">{pct}% tačnosti</span>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-3 flex justify-between">
                      <span>Datum: {dateStr}</span>
                      <span>{result.correctAnswers}/{result.totalQuestions} tačnih</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {passed.length > 0 && (
          <p className="text-sm text-center text-muted-foreground" data-testid="text-certs-count">
            Ukupno položenih kvizova: <strong>{passed.length}</strong>
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
