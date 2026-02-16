import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
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
  CheckCircle,
  XCircle,
  Trophy,
  Send,
  FileQuestion,
} from "lucide-react";
import type { Quiz, Question, QuizResult } from "@shared/schema";

type QuizWithQuestions = Quiz & { questions: Question[] };

export default function QuizPage() {
  const [, params] = useRoute("/ucenik/kviz/:id");
  const quizId = params?.id;
  const { toast } = useToast();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data: quiz, isLoading } = useQuery<QuizWithQuestions>({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!quiz) throw new Error("Quiz not loaded");
      const payload = {
        quizId: quiz.id,
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedAnswer: answers[q.id] || "",
        })),
      };
      const res = await apiRequest("POST", "/api/quiz-results", payload);
      return res.json() as Promise<QuizResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-results/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće predati kviz.",
        variant: "destructive",
      });
    },
  });

  const questions = quiz?.questions ?? [];
  const totalQ = questions.length;
  const question = questions[currentQ];
  const progressValue = totalQ > 0 ? ((currentQ + 1) / totalQ) * 100 : 0;
  const allAnswered = questions.every((q) => answers[q.id]);
  const isLast = currentQ === totalQ - 1;

  const selectAnswer = (answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  };

  const options: { key: string; label: string; field: keyof Question }[] = [
    { key: "a", label: "A", field: "optionA" },
    { key: "b", label: "B", field: "optionB" },
    { key: "c", label: "C", field: "optionC" },
    { key: "d", label: "D", field: "optionD" },
  ];

  if (submitted && result) {
    return (
      <DashboardLayout role="student">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Trophy className="mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold" data-testid="text-result-title">Kviz završen!</h1>
            <p className="text-muted-foreground">{quiz?.title}</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Točnih odgovora</p>
                  <p className="text-3xl font-bold" data-testid="text-correct-count">
                    {result.correctAnswers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Netočnih odgovora</p>
                  <p className="text-3xl font-bold" data-testid="text-wrong-count">
                    {result.wrongAnswers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno pitanja</p>
                  <p className="text-3xl font-bold">{result.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Osvojeni bodovi</p>
                  <p className="text-3xl font-bold" data-testid="text-earned-points">
                    {result.score}
                  </p>
                </div>
              </div>

              <Progress
                value={(result.correctAnswers / result.totalQuestions) * 100}
                className="h-3"
              />

              <div className="flex gap-3 flex-wrap justify-center pt-2">
                <Button asChild variant="outline" data-testid="link-back-library">
                  <Link href="/ucenik/biblioteka">Natrag u biblioteku</Link>
                </Button>
                <Button asChild data-testid="link-my-results">
                  <Link href="/ucenik/rezultati">Moji rezultati</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" asChild data-testid="button-back">
          <Link href="/ucenik/biblioteka">
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
        ) : !quiz || totalQ === 0 ? (
          <div className="text-center py-16">
            <FileQuestion className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Kviz nije pronađen</p>
            <p className="text-muted-foreground">Ovaj kviz ne postoji ili nema pitanja.</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-quiz-title">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pitanje {currentQ + 1} od {totalQ}
              </p>
            </div>

            <Progress value={progressValue} className="h-2" />

            <Card>
              <CardHeader>
                <CardTitle className="text-base leading-relaxed" data-testid="text-question">
                  {question.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {options.map((opt) => {
                  const selected = answers[question.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => selectAnswer(opt.key)}
                      className={`w-full text-left p-4 rounded-md border transition-colors ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-option-${opt.key}`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={selected ? "default" : "outline"}
                          className="shrink-0 mt-0.5"
                        >
                          {opt.label}
                        </Badge>
                        <span className="text-sm">{question[opt.field] as string}</span>
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
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded-md text-xs font-medium border transition-colors ${
                      i === currentQ
                        ? "border-primary bg-primary/10"
                        : answers[questions[i].id]
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
                  onClick={() => setCurrentQ((p) => Math.min(totalQ - 1, p + 1))}
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
