import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  ArrowRight,
  XCircle,
  Trophy,
  Send,
  FileQuestion,
  Lock,
  Crown,
  Timer,
} from "lucide-react";
import type { Quiz, Question, QuizResult, Book } from "@shared/schema";
import { DifficultyIcon } from "@/components/difficulty-icon";

type QuizWithQuestions = Quiz & { questions: Question[] };

type SubscriptionStatus = {
  subscriptionType: string;
  completedQuizzes: number;
  freeQuizLimit: number | null;
  canTakeQuiz: boolean;
};

export default function QuizPage() {
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const basePath = isReader ? "/citanje" : "/ucenik";
  const dashboardRole = isReader ? "reader" : "student" as const;
  const [, studentParams] = useRoute("/ucenik/kviz/:id");
  const [, readerParams] = useRoute("/citanje/kviz/:id");
  const quizId = studentParams?.id || readerParams?.id;
  const { toast } = useToast();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  const { data: quiz, isLoading } = useQuery<QuizWithQuestions>({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
  });

  const { data: book } = useQuery<Book>({
    queryKey: ["/api/books", quiz?.bookId],
    enabled: !!quiz?.bookId,
  });

  const POINTS_PER_Q: Record<string, number> = { R1: 1, R4: 3, R7: 5, O: 7, A: 10 };
  const ptsPerQ = POINTS_PER_Q[book?.ageGroup || "R1"] || 1;

  const { data: subStatus } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  const { data: completionData } = useQuery<{ count: number }>({
    queryKey: ["/api/quizzes", quizId, "completions"],
    enabled: !!quizId,
  });

  const { data: eligibility } = useQuery<{ canTake: boolean; reason?: string; message?: string; retryAfterHours?: number }>({
    queryKey: ["/api/quizzes", quizId, "eligibility"],
    enabled: !!quizId,
  });

  // VAŽNO: questionsToUse mora biti definiran PRIJE svih callbacka koji ga koriste
  const questionsToUse = useMemo(() => {
    if (!quiz?.questions) return [];
    if (quiz.questions.length <= 20) return quiz.questions;
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  }, [quiz?.questions]);

  const moveToNext = useCallback(() => {
    setCurrentQ(prev => {
      if (prev < questionsToUse.length - 1) {
        return prev + 1;
      }
      setAutoSubmitTriggered(true);
      return prev;
    });
  }, [questionsToUse.length]);

  useEffect(() => {
    if (submitted || !quizStarted || !quiz || questionsToUse.length === 0) return;
    setTimeLeft(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          moveToNext();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQ, submitted, quizStarted, questionsToUse.length, moveToNext]);

  useEffect(() => {
    if (quiz && questionsToUse.length > 0 && !quizStarted && !submitted) {
      setQuizStarted(true);
    }
  }, [quiz, questionsToUse.length, quizStarted, submitted]);

  useEffect(() => {
    if (submitted && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [submitted]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!quiz) throw new Error("Quiz not loaded");
      const payload = {
        quizId: quiz.id,
        answers: questionsToUse.map((q) => ({
          questionId: q.id,
          selectedAnswer: answers[q.id] || "",
        })),
      };
      const res = await apiRequest("POST", "/api/quiz-results", payload);
      return res.json() as Promise<QuizResult & { passed?: boolean; passPercentage?: number }>;
    },
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-results/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: Error) => {
      if (error.message === "SUBSCRIPTION_REQUIRED") {
        setShowSubscriptionPrompt(true);
        return;
      }
      toast({
        title: "Greška",
        description: error.message || "Nije moguće predati kviz.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (autoSubmitTriggered && !submitted && !submitMutation.isPending) {
      if (timerRef.current) clearInterval(timerRef.current);
      submitMutation.mutate();
    }
  }, [autoSubmitTriggered, submitted, submitMutation.isPending]);

  const totalQuestionsCount = questionsToUse.length;
  const currentQuestion = questionsToUse[currentQ];
  const progressValue = totalQuestionsCount > 0 ? ((currentQ + 1) / totalQuestionsCount) * 100 : 0;
  const allAnswered = questionsToUse.every((q) => answers[q.id]);
  const isLast = currentQ === totalQuestionsCount - 1;

  const selectAnswer = (answer: string) => {
    if (submitted || !currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const options: { key: string; label: string; field: keyof Question }[] = [
    { key: "a", label: "A", field: "optionA" },
    { key: "b", label: "B", field: "optionB" },
    { key: "c", label: "C", field: "optionC" },
    { key: "d", label: "D", field: "optionD" },
  ];

  if (eligibility && !eligibility.canTake) {
    return (
      <DashboardLayout role={dashboardRole}>
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <div className="space-y-4">
            {eligibility.reason === "cooldown" ? (
              <Timer className="mx-auto h-12 w-12 text-orange-400" />
            ) : (
              <Trophy className="mx-auto h-12 w-12 text-green-500" />
            )}
            <h1 className="text-2xl font-bold">
              {eligibility.reason === "passed" ? "Kviz već položen" : "Pričekajte malo"}
            </h1>
            <p className="text-muted-foreground">{eligibility.message}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`${basePath}/biblioteka`}>Natrag u biblioteku</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (showSubscriptionPrompt) {
    return (
      <DashboardLayout role={dashboardRole}>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl font-bold" data-testid="text-subscription-required">Potrebna pretplata</h1>
            <p className="text-muted-foreground">
              Nadogradite svoj paket za neograničen pristup svim kvizovima.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-primary">
              <CardContent className="p-6 text-center space-y-3">
                <Crown className="mx-auto h-8 w-8 text-primary" />
                <h3 className="font-bold text-lg">Standard</h3>
                <p className="text-3xl font-bold">10 <span className="text-sm font-normal text-muted-foreground">KM/godišnje</span></p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Neograničen broj kvizova</li>
                  <li>Pristup svim knjigama</li>
                  <li>Detaljne statistike</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <Crown className="mx-auto h-8 w-8 text-yellow-500" />
                <h3 className="font-bold text-lg">Full</h3>
                <p className="text-3xl font-bold">20 <span className="text-sm font-normal text-muted-foreground">KM/godišnje</span></p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Sve iz Standard paketa</li>
                  <li>Učešće u takmičenjima</li>
                  <li>Učešće u izvlačenjima</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button asChild data-testid="button-go-pricing">
              <Link href="/cijene">Pogledaj pakete</Link>
            </Button>
            <Button variant="outline" asChild data-testid="button-back-library">
              <Link href={`${basePath}/biblioteka`}>Natrag u biblioteku</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (submitted && result) {
    const extResult = result as QuizResult & { passed?: boolean; passPercentage?: number };
    const passed = extResult.passed !== false;
    const percentage = extResult.passPercentage ?? Math.round((result.correctAnswers / result.totalQuestions) * 100);

    return (
      <DashboardLayout role={dashboardRole}>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            {passed ? (
              <Trophy className="mx-auto h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
            )}
            <h1 className="text-2xl font-bold" data-testid="text-result-title">
              {passed ? "Kviz završen!" : "Kviz nije položen"}
            </h1>
            <p className="text-muted-foreground">{quiz?.title}</p>
            {!passed && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm" data-testid="text-fail-message">
                <p className="font-medium text-red-700 dark:text-red-300">Potrebno je najmanje 50% tačnih odgovora za prolaz.</p>
                <p className="text-red-600 dark:text-red-400 mt-1">Vaš rezultat: {percentage}% — bodovi nisu dodijeljeni i knjiga nije uračunata.</p>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Točnih odgovora</p>
                  <p className="text-3xl font-bold" data-testid="text-correct-count">{result.correctAnswers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Netočnih odgovora</p>
                  <p className="text-3xl font-bold" data-testid="text-wrong-count">{result.wrongAnswers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno pitanja</p>
                  <p className="text-3xl font-bold">{result.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Osvojeni bodovi</p>
                  <p className={`text-3xl font-bold ${passed ? "" : "text-red-500"}`} data-testid="text-earned-points">{result.score}</p>
                </div>
              </div>
              <Progress value={percentage} className={`h-3 ${!passed ? "[&>div]:bg-red-500" : ""}`} />
              <p className="text-center text-sm text-muted-foreground">{percentage}% tačno</p>
              <div className="flex gap-3 flex-wrap justify-center pt-2">
                <Button asChild variant="outline" data-testid="link-back-library">
                  <Link href={`${basePath}/biblioteka`}>Natrag u biblioteku</Link>
                </Button>
                <Button asChild data-testid="link-my-results">
                  <Link href={`${basePath}/rezultati`}>Moji rezultati</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={dashboardRole}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" asChild data-testid="button-back">
          <Link href={`${basePath}/biblioteka`}>
            <ArrowLeft />
            <span>Natrag</span>
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !quiz || totalQuestionsCount === 0 ? (
          <div className="text-center py-16">
            <FileQuestion className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Kviz nije pronađen</p>
            <p className="text-muted-foreground">Ovaj kviz ne postoji ili nema pitanja.</p>
          </div>
        ) : !currentQuestion ? null : (
          <>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-quiz-title">{quiz.title}</h1>
              {quiz.quizAuthor && (
                <p className="text-xs text-muted-foreground" data-testid="text-quiz-author">
                  Autor kviza: {quiz.quizAuthor}
                </p>
              )}
              {completionData && completionData.count > 0 && (
                <p className="text-xs text-muted-foreground" data-testid="text-quiz-completions">
                  Kviz je do sada {completionData.count} {completionData.count === 1 ? "put" : "puta"} urađen
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <p className="text-sm text-muted-foreground">
                  Pitanje {currentQ + 1} od {totalQuestionsCount}
                </p>
                <Badge variant={timeLeft <= 5 ? "destructive" : timeLeft <= 10 ? "default" : "outline"} data-testid="badge-timer" className="tabular-nums">
                  <Timer className="mr-1 h-3 w-3" />
                  {timeLeft}s
                </Badge>
                {book?.readingDifficulty && (
                  <DifficultyIcon difficulty={book.readingDifficulty} size="sm" />
                )}
              </div>
            </div>

            <Progress value={progressValue} className="h-2" />

            <Card>
              <CardHeader>
                <CardTitle className="text-base leading-relaxed" data-testid="text-question">
                  {currentQuestion.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {options.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => selectAnswer(opt.key)}
                      className={`w-full text-left p-4 rounded-md border transition-colors ${
                        selected ? "border-primary bg-primary/10" : "hover-elevate"
                      }`}
                      data-testid={`button-option-${opt.key}`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant={selected ? "default" : "outline"} className="shrink-0 mt-0.5">
                          {opt.label}
                        </Badge>
                        <span className="text-sm">{currentQuestion[opt.field] as string}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                disabled={currentQ === 0}
                data-testid="button-prev"
              >
                <ArrowLeft />
                <span>Prethodno</span>
              </Button>

              <div className="flex gap-1 flex-wrap">
                {questionsToUse.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded-md text-xs font-medium border transition-colors ${
                      i === currentQ
                        ? "border-primary bg-primary/10"
                        : answers[q.id]
                          ? "bg-muted"
                          : ""
                    }`}
                    data-testid={`button-question-${i}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {isLast ? (
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={!allAnswered || submitMutation.isPending}
                  data-testid="button-submit-quiz"
                >
                  <Send />
                  <span>{submitMutation.isPending ? "Šaljem..." : "Predaj kviz"}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQ((p) => Math.min(totalQuestionsCount - 1, p + 1))}
                  data-testid="button-next"
                >
                  <span>Sljedeće</span>
                  <ArrowRight />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
