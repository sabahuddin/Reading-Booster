import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, PlusCircle, Trash2, Send, Clock, Lock, CheckCircle2, FileQuestion, Heart,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AgeGroupBadge } from "@/components/age-group-badge";
import { BookCover } from "@/components/book-cover";

interface QuizOverview {
  quizId: string;
  quizTitle: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookAgeGroup: string;
  coverImage: string | null;
  questionCount: number;
  teacherEditStatus: "none" | "pending" | "approved";
  approvedTeacherName: string | null;
  teacherAddedQuestionsCount: number;
  canEdit: boolean;
}

interface QuestionDraft {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

function emptyQuestion(): QuestionDraft {
  return { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "a" };
}

function StatusBadge({ status, approvedBy }: { status: string; approvedBy?: string | null }) {
  if (status === "approved") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <Lock className="mr-1 h-3 w-3" />
        Odobreno{approvedBy ? ` · ${approvedBy}` : ""}
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
        <Clock className="mr-1 h-3 w-3" />
        Na čekanju
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <PlusCircle className="mr-1 h-3 w-3" />
      Dostupno za uređivanje
    </Badge>
  );
}

export default function TeacherQuizzes() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "none" | "pending" | "approved">("all");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizOverview | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  const { data: quizzes, isLoading } = useQuery<QuizOverview[]>({
    queryKey: ["/api/teacher/quizzes-overview"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/quizzes-overview", { credentials: "include" });
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/teacher/quizzes/${selectedQuiz!.quizId}/submit-questions`, { questions });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Uspješno poslano!", description: "Vaša pitanja čekaju odobrenje administracije." });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/quizzes-overview"] });
      closeModal();
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter((q) => {
      const matchSearch =
        q.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        q.bookAuthor.toLowerCase().includes(search.toLowerCase()) ||
        q.quizTitle.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || q.teacherEditStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quizzes, search, statusFilter]);

  const counts = useMemo(() => ({
    all: quizzes?.length ?? 0,
    none: quizzes?.filter(q => q.teacherEditStatus === "none").length ?? 0,
    pending: quizzes?.filter(q => q.teacherEditStatus === "pending").length ?? 0,
    approved: quizzes?.filter(q => q.teacherEditStatus === "approved").length ?? 0,
  }), [quizzes]);

  function openEditModal(quiz: QuizOverview) {
    setSelectedQuiz(quiz);
    setQuestions([emptyQuestion()]);
    setEditModalOpen(true);
  }

  function closeModal() {
    setEditModalOpen(false);
    setSelectedQuiz(null);
    setQuestions([emptyQuestion()]);
  }

  function updateQuestion(idx: number, field: keyof QuestionDraft, value: string) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  }

  function addQuestion() {
    if (questions.length < 5) setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function canSubmit() {
    return questions.every(
      (q) => q.questionText.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim() && q.correctAnswer
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-start gap-3">
          <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-primary text-sm">Hvala na saradnji!</p>
            <p className="text-sm text-muted-foreground">
              Administracija platforme <strong>Čitanje.ba</strong> zahvaljuje nastavnicima koji doprinose kvalitetu
              kvizova. Vaša pitanja prolaze pregled i obogaćuju bazu znanja za sve učenike.
            </p>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileQuestion className="h-6 w-6 text-primary" />
            Kvizovi
          </h1>
          <p className="text-muted-foreground mt-1">
            Predložite nova pitanja za kvizove. Svaki kviz prima do <strong>5 novih pitanja</strong> koja administracija pregleda i odobrava.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pretraži po naslovu knjige ili autoru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-quizzes"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-52" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi kvizovi ({counts.all})</SelectItem>
              <SelectItem value="none">Dostupni za uređivanje ({counts.none})</SelectItem>
              <SelectItem value="pending">Na čekanju ({counts.pending})</SelectItem>
              <SelectItem value="approved">Odobreni ({counts.approved})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-3">
                <Skeleton className="h-36 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileQuestion className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="font-medium text-lg">Nema kvizova</p>
            <p className="text-sm">
              {search || statusFilter !== "all" ? "Nema rezultata za odabrani filter." : "Kvizovi još nisu dodani."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((quiz) => (
              <Card key={quiz.quizId} className="flex flex-col h-full" data-testid={`card-quiz-${quiz.quizId}`}>
                <CardContent className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex gap-3">
                    <div className="w-16 shrink-0">
                      <div className="aspect-[2/3] rounded-md bg-muted overflow-hidden">
                        <BookCover
                          title={quiz.bookTitle}
                          author={quiz.bookAuthor}
                          ageGroup={quiz.bookAgeGroup}
                          coverImage={quiz.coverImage}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2" data-testid={`text-quiz-book-title-${quiz.quizId}`}>
                        {quiz.bookTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{quiz.bookAuthor}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <AgeGroupBadge ageGroup={quiz.bookAgeGroup} />
                        <Badge variant="outline" className="text-xs">
                          {quiz.questionCount} pitanja
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 space-y-2">
                    <StatusBadge status={quiz.teacherEditStatus} approvedBy={quiz.approvedTeacherName} />

                    {quiz.teacherEditStatus === "pending" && quiz.teacherAddedQuestionsCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Predloženo {quiz.teacherAddedQuestionsCount} pitanje(a) — čeka pregled
                      </p>
                    )}

                    {quiz.canEdit && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => openEditModal(quiz)}
                        data-testid={`button-edit-quiz-${quiz.quizId}`}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Dodaj pitanja (1–5)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={editModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dodaj pitanja kvizu</DialogTitle>
            <DialogDescription>
              <strong>{selectedQuiz?.bookTitle}</strong> — Možete dodati 1–5 pitanja. Administracija pregleda i odobrava svako pitanje.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 mb-2">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Administracija Čitanje.ba zahvaljuje na saradnji i doprinosu!
            </p>
          </div>

          <div className="space-y-6 py-2">
            {questions.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3" data-testid={`question-block-${idx}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Pitanje {idx + 1}</span>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(idx)}
                      data-testid={`button-remove-question-${idx}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tekst pitanja *</label>
                  <Textarea
                    placeholder="Unesite pitanje o sadržaju knjige..."
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                    className="mt-1"
                    rows={2}
                    data-testid={`input-question-text-${idx}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const field = `option${letter}` as keyof QuestionDraft;
                    return (
                      <div key={letter}>
                        <label className="text-xs font-medium text-muted-foreground">Odgovor {letter} *</label>
                        <Input
                          placeholder={`Odgovor ${letter}...`}
                          value={q[field] as string}
                          onChange={(e) => updateQuestion(idx, field, e.target.value)}
                          className="mt-1"
                          data-testid={`input-option-${letter.toLowerCase()}-${idx}`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tačan odgovor *</label>
                  <Select value={q.correctAnswer} onValueChange={(val) => updateQuestion(idx, "correctAnswer", val)}>
                    <SelectTrigger className="mt-1" data-testid={`select-correct-answer-${idx}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">A</SelectItem>
                      <SelectItem value="b">B</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="d">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {questions.length < 5 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={addQuestion}
                data-testid="button-add-question"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj još jedno pitanje ({questions.length}/5)
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Otkaži</Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit() || submitMutation.isPending}
              data-testid="button-submit-questions"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? "Šaljem..." : "Pošalji na pregled"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
