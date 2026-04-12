import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, PlusCircle, Trash2, Send, Clock, Lock, CheckCircle2, FileQuestion, Heart,
  BookPlus, BookOpen, AlertCircle, ChevronDown, ChevronUp, Eye,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@shared/schema";

// ─── Shared types ─────────────────────────────────────────────────────────────

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

const AGE_GROUPS = [
  { value: "R1", label: "R1 (do 9 godina)" },
  { value: "R4", label: "R4 (10–12 godina)" },
  { value: "R7", label: "R7 (13–15 godina)" },
  { value: "O", label: "O (16–18 godina)" },
  { value: "A", label: "A (odrasli)" },
];

const GENRES = [
  "lektira", "roman", "bajke_basne", "avantura_fantasy", "humor", "poezija",
  "beletristika", "klasici", "drama", "detektivski_roman", "historijski_roman",
  "djeciji_roman", "pustolovni_roman", "pripovjetke", "islam", "mitologija",
  "zanimljiva_nauka", "savremena_knjizevnost", "publicistika",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      Dostupno
    </Badge>
  );
}

function QuestionEditor({
  questions,
  onChange,
  max = 5,
}: {
  questions: QuestionDraft[];
  onChange: (qs: QuestionDraft[]) => void;
  max?: number;
}) {
  function update(idx: number, field: keyof QuestionDraft, value: string) {
    onChange(questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  }
  function add() { if (questions.length < max) onChange([...questions, emptyQuestion()]); }
  function remove(idx: number) { onChange(questions.filter((_, i) => i !== idx)); }

  return (
    <div className="space-y-5">
      {questions.map((q, idx) => (
        <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/20" data-testid={`question-block-${idx}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Pitanje {idx + 1}</span>
            {questions.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => remove(idx)} data-testid={`button-remove-q-${idx}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tekst pitanja *</label>
            <Textarea
              placeholder="Unesite pitanje o sadržaju knjige..."
              value={q.questionText}
              onChange={e => update(idx, "questionText", e.target.value)}
              className="mt-1"
              rows={2}
              data-testid={`input-q-text-${idx}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["A", "B", "C", "D"] as const).map(letter => {
              const field = `option${letter}` as keyof QuestionDraft;
              return (
                <div key={letter}>
                  <label className="text-xs font-medium text-muted-foreground">Odgovor {letter} *</label>
                  <Input
                    placeholder={`Odgovor ${letter}...`}
                    value={q[field] as string}
                    onChange={e => update(idx, field, e.target.value)}
                    className="mt-1"
                    data-testid={`input-opt-${letter.toLowerCase()}-${idx}`}
                  />
                </div>
              );
            })}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tačan odgovor *</label>
            <Select value={q.correctAnswer} onValueChange={v => update(idx, "correctAnswer", v)}>
              <SelectTrigger className="mt-1" data-testid={`select-correct-${idx}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["a", "b", "c", "d"].map(l => (
                  <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      {questions.length < max && (
        <Button variant="outline" className="w-full" onClick={add} data-testid="button-add-question">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj pitanje ({questions.length}/{max})
        </Button>
      )}
    </div>
  );
}

function isQValid(q: QuestionDraft) {
  return q.questionText.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim() && q.correctAnswer;
}

// ─── Thanks banner ─────────────────────────────────────────────────────────────
function ThanksNote() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 flex items-start gap-3">
      <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">
        <strong className="text-primary">Hvala na saradnji!</strong>{" "}
        Administracija platforme <strong>Čitanje.ba</strong> zahvaljuje nastavnicima koji doprinose kvalitetu kvizova.
        Svaki vaš prijedlog prolazi pregled i obogaćuje bazu znanja za sve učenike.
      </p>
    </div>
  );
}

// ─── Tab 1: Izmjene postojećih kvizova ────────────────────────────────────────
interface ExistingQuestions {
  official: Array<{ id: string; questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string }>;
  pending: Array<{ id: string; questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string }>;
}

function OfficialQuestionsPanel({ questions }: { questions: ExistingQuestions["official"] }) {
  const [open, setOpen] = useState(false);
  const letters: Record<string, string> = { a: "A", b: "B", c: "C", d: "D" };
  return (
    <div className="rounded-lg border bg-muted/40">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium"
        onClick={() => setOpen(o => !o)}
        data-testid="button-toggle-official-questions"
      >
        <span className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          Trenutna pitanja kviza ({questions.length})
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 max-h-72 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={q.id} className="text-xs border rounded-md p-3 bg-background">
              <p className="font-semibold mb-1">{i + 1}. {q.questionText}</p>
              {(["a","b","c","d"] as const).map(l => (
                <p key={l} className={q.correctAnswer === l ? "text-green-700 font-medium" : "text-muted-foreground"}>
                  {letters[l]}) {(q as any)[`option${l.toUpperCase()}`]}
                  {q.correctAnswer === l && " ✓"}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabQuizEdits() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "none" | "pending" | "approved">("all");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizOverview | null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  const { data: quizzes, isLoading } = useQuery<QuizOverview[]>({
    queryKey: ["/api/teacher/quizzes-overview"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/quizzes-overview", { credentials: "include" });
      return res.json();
    },
  });

  // Fetch existing questions when a quiz is selected
  const { data: existingQs, isLoading: loadingQs } = useQuery<ExistingQuestions>({
    queryKey: ["/api/teacher/quizzes", selectedQuiz?.quizId, "questions"],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/quizzes/${selectedQuiz!.quizId}/questions`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedQuiz,
  });

  // When questions load, pre-populate editor with pending teacher questions (if any)
  useEffect(() => {
    if (!existingQs || questionsLoaded) return;
    if (existingQs.pending.length > 0) {
      setQuestions(existingQs.pending.map(q => ({
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
      })));
    }
    setQuestionsLoaded(true);
  }, [existingQs, questionsLoaded]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/teacher/quizzes/${selectedQuiz!.quizId}/submit-questions`, { questions });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Uspješno poslano!", description: "Vaša pitanja čekaju odobrenje administracije." });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/quizzes-overview"] });
      setSelectedQuiz(null);
      setQuestions([emptyQuestion()]);
      setQuestionsLoaded(false);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function openModal(quiz: QuizOverview) {
    setSelectedQuiz(quiz);
    setQuestions([emptyQuestion()]);
    setQuestionsLoaded(false);
  }

  function closeModal() {
    setSelectedQuiz(null);
    setQuestions([emptyQuestion()]);
    setQuestionsLoaded(false);
  }

  const filtered = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter(q => {
      const matchSearch =
        q.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        q.bookAuthor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || q.teacherEditStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quizzes, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pretraži po naslovu ili autoru..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-quizzes"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-52" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi kvizovi</SelectItem>
            <SelectItem value="none">Dostupni za izmjene</SelectItem>
            <SelectItem value="pending">Na čekanju</SelectItem>
            <SelectItem value="approved">Odobreni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileQuestion className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p className="font-medium">Nema kvizova za odabrani filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(quiz => (
            <Card key={quiz.quizId} className="flex flex-col" data-testid={`card-quiz-${quiz.quizId}`}>
              <CardContent className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="font-semibold text-sm line-clamp-2" data-testid={`text-quiz-book-${quiz.quizId}`}>{quiz.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">{quiz.bookAuthor} · {quiz.bookAgeGroup} · {quiz.questionCount} pitanja</p>
                </div>
                <div className="mt-auto space-y-2">
                  <StatusBadge status={quiz.teacherEditStatus} approvedBy={quiz.approvedTeacherName} />
                  {quiz.teacherEditStatus === "pending" && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                      Na čekanju ({quiz.teacherAddedQuestionsCount} pitanja) — možete promijeniti prijedlog
                    </p>
                  )}
                  {quiz.canEdit && (
                    <Button
                      size="sm"
                      className="w-full"
                      variant={quiz.teacherEditStatus === "pending" ? "outline" : "default"}
                      onClick={() => openModal(quiz)}
                      data-testid={`button-edit-quiz-${quiz.quizId}`}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {quiz.teacherEditStatus === "pending" ? "Ažuriraj prijedlog" : "Uredi kviz (1–40 pitanja)"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedQuiz} onOpenChange={open => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uredi kviz — {selectedQuiz?.bookTitle}</DialogTitle>
            <DialogDescription>
              {selectedQuiz?.teacherEditStatus === "pending"
                ? "Vaš prijedlog čeka odobrenje. Možete ažurirati pitanja — nova lista zamjenjuje prethodnu."
                : "Unesite 1–40 pitanja koja zamjenjuju trenutni sadržaj kviza. Admin odobrava i vaše ime se prikazuje ispod kviza."}
            </DialogDescription>
          </DialogHeader>

          {/* Existing official questions — collapsible read-only */}
          {loadingQs ? (
            <Skeleton className="h-10 w-full" />
          ) : existingQs && existingQs.official.length > 0 ? (
            <OfficialQuestionsPanel questions={existingQs.official} />
          ) : null}

          {/* Pending note */}
          {existingQs && existingQs.pending.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Vaš prethodni prijedlog ({existingQs.pending.length} pitanja) je učitan u editor ispod. Možete ga izmijeniti i ponovo poslati.</span>
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />Administracija Čitanje.ba zahvaljuje na saradnji!
            </p>
          </div>

          {loadingQs ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          ) : (
            <QuestionEditor questions={questions} onChange={setQuestions} max={40} />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Otkaži</Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!questions.every(isQValid) || submitMutation.isPending || loadingQs}
              data-testid="button-submit-questions"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? "Šaljem..."
                : selectedQuiz?.teacherEditStatus === "pending"
                ? `Ažuriraj prijedlog (${questions.length} pitanja)`
                : `Pošalji na pregled (${questions.length} pitanja)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab 2: Kreiraj kviz za knjigu bez kviza ───────────────────────────────────
function TabCreateQuiz() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/teacher/books-without-quiz"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/books-without-quiz", { credentials: "include" });
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/teacher/quizzes/create-for-book", {
        bookId: selectedBook!.id,
        quizTitle: quizTitle.trim(),
        questions,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Kviz poslan na odobrenje!", description: "Admin će pregledati vaš kviz i odobriti ga." });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/books-without-quiz"] });
      setSelectedBook(null);
      setQuizTitle("");
      setQuestions([emptyQuestion()]);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    if (!books) return [];
    return books.filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    );
  }, [books, search]);

  const canSubmit = quizTitle.trim() && questions.length >= 1 && questions.every(isQValid);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          Ovdje su prikazane samo knjige koje još <strong>nemaju kviz</strong>. Kreirajte kviz s 1–40 pitanja koji administrator mora odobriti.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Pretraži knjige bez kviza..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-books-no-quiz"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Sve knjige već imaju kviz, ili nema rezultata za pretragu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(book => (
            <Card
              key={book.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => { setSelectedBook(book); setQuizTitle(`Kviz — ${book.title}`); setQuestions([emptyQuestion()]); }}
              data-testid={`card-book-no-quiz-${book.id}`}
            >
              <CardContent className="p-4">
                <p className="font-semibold text-sm line-clamp-2">{book.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{book.author} · {book.ageGroup}</p>
                <Button size="sm" className="mt-3 w-full" variant="outline">
                  <PlusCircle className="mr-2 h-3 w-3" />
                  Kreiraj kviz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedBook} onOpenChange={open => { if (!open) { setSelectedBook(null); setQuizTitle(""); setQuestions([emptyQuestion()]); }}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kreiraj kviz</DialogTitle>
            <DialogDescription>
              <BookOpen className="inline mr-1 h-4 w-4" />
              <strong>{selectedBook?.title}</strong> — {selectedBook?.author}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Naziv kviza *</label>
              <Input
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="npr. Kviz — Harry Potter i Kamen mudrosti"
                className="mt-1"
                data-testid="input-quiz-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pitanja (1–40) *</label>
              <p className="text-xs text-muted-foreground mb-3">Unesite najmanje 1, a najviše 40 pitanja</p>
              <QuestionEditor questions={questions} onChange={setQuestions} max={40} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBook(null)}>Otkaži</Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit || submitMutation.isPending}
              data-testid="button-submit-new-quiz"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? "Šaljem..." : `Pošalji kviz (${questions.length} pitanja)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab 3: Nova knjiga + kviz ─────────────────────────────────────────────────
function TabCreateBookAndQuiz() {
  const { toast } = useToast();
  const [bookForm, setBookForm] = useState({
    title: "", author: "", description: "", ageGroup: "R1", genre: "lektira",
    readingDifficulty: "srednje" as "lako" | "srednje" | "tesko",
    pageCount: "", publisher: "", isbn: "",
  });
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  function setBook(field: string, value: string) {
    setBookForm(prev => ({ ...prev, [field]: value }));
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/teacher/books-and-quizzes/create", {
        book: bookForm,
        quizTitle: quizTitle.trim(),
        questions,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Knjiga i kviz poslani na odobrenje!", description: "Admin će pregledati i odobriti vaš prijedlog." });
      setBookForm({ title: "", author: "", description: "", ageGroup: "R1", genre: "lektira", readingDifficulty: "srednje", pageCount: "", publisher: "", isbn: "" });
      setQuizTitle("");
      setQuestions([emptyQuestion()]);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const canSubmit = bookForm.title.trim() && bookForm.author.trim() && quizTitle.trim() && questions.length >= 1 && questions.every(isQValid);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          Ovu opciju koristite kada knjiga <strong>ne postoji u biblioteci</strong>. Vaš prijedlog (knjiga + kviz) administrator mora odobriti prije nego postane dostupno.
        </p>
      </div>

      {/* Podaci o knjizi */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <BookPlus className="h-5 w-5 text-primary" />
          Podaci o knjizi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Naslov *</label>
            <Input value={bookForm.title} onChange={e => setBook("title", e.target.value)} placeholder="npr. Mali princ" className="mt-1" data-testid="input-book-title" />
          </div>
          <div>
            <label className="text-sm font-medium">Autor *</label>
            <Input value={bookForm.author} onChange={e => setBook("author", e.target.value)} placeholder="npr. Antoine de Saint-Exupéry" className="mt-1" data-testid="input-book-author" />
          </div>
          <div>
            <label className="text-sm font-medium">Starosna skupina *</label>
            <Select value={bookForm.ageGroup} onValueChange={v => setBook("ageGroup", v)}>
              <SelectTrigger className="mt-1" data-testid="select-book-age-group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map(ag => <SelectItem key={ag.value} value={ag.value}>{ag.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Žanr</label>
            <Select value={bookForm.genre} onValueChange={v => setBook("genre", v)}>
              <SelectTrigger className="mt-1" data-testid="select-book-genre">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map(g => <SelectItem key={g} value={g}>{g.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Težina čitanja</label>
            <Select value={bookForm.readingDifficulty} onValueChange={v => setBook("readingDifficulty", v)}>
              <SelectTrigger className="mt-1" data-testid="select-book-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lako">Lako</SelectItem>
                <SelectItem value="srednje">Srednje</SelectItem>
                <SelectItem value="tesko">Teško</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Broj stranica</label>
            <Input type="number" value={bookForm.pageCount} onChange={e => setBook("pageCount", e.target.value)} placeholder="npr. 128" className="mt-1" data-testid="input-book-pages" />
          </div>
          <div>
            <label className="text-sm font-medium">Izdavač</label>
            <Input value={bookForm.publisher} onChange={e => setBook("publisher", e.target.value)} placeholder="npr. Bosanska knjiga" className="mt-1" data-testid="input-book-publisher" />
          </div>
          <div>
            <label className="text-sm font-medium">ISBN</label>
            <Input value={bookForm.isbn} onChange={e => setBook("isbn", e.target.value)} placeholder="npr. 9789926234567" className="mt-1" data-testid="input-book-isbn" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Opis knjige</label>
          <Textarea value={bookForm.description} onChange={e => setBook("description", e.target.value)} placeholder="Kratki opis knjige..." className="mt-1" rows={3} data-testid="input-book-description" />
        </div>
      </div>

      {/* Podaci o kvizu */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          Podaci o kvizu
        </h3>
        <div>
          <label className="text-sm font-medium">Naziv kviza *</label>
          <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="npr. Kviz — Mali princ" className="mt-1" data-testid="input-new-quiz-title" />
        </div>
        <div>
          <label className="text-sm font-medium">Pitanja (1–40) *</label>
          <p className="text-xs text-muted-foreground mb-3">Unesite najmanje 1, a najviše 40 pitanja</p>
          <QuestionEditor questions={questions} onChange={setQuestions} max={40} />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={() => submitMutation.mutate()}
        disabled={!canSubmit || submitMutation.isPending}
        data-testid="button-submit-book-and-quiz"
      >
        <Send className="mr-2 h-5 w-5" />
        {submitMutation.isPending ? "Šaljem na odobrenje..." : `Pošalji na odobrenje (${questions.length} pitanja)`}
      </Button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function TeacherQuizzes() {
  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <ThanksNote />

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileQuestion className="h-6 w-6 text-primary" />
            Kvizovi
          </h1>
          <p className="text-muted-foreground mt-1">
            Dopunite postojeće kvizove pitanjima, ili kreirajte nov kviz za knjige koje ga još nemaju.
            Sve izmjene odobrava administracija platforme.
          </p>
        </div>

        <Tabs defaultValue="edit">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="edit" data-testid="tab-edit-quizzes">
              <FileQuestion className="mr-2 h-4 w-4" />
              Izmjene kvizova
            </TabsTrigger>
            <TabsTrigger value="create" data-testid="tab-create-quiz">
              <PlusCircle className="mr-2 h-4 w-4" />
              Kreiraj kviz
            </TabsTrigger>
            <TabsTrigger value="book-quiz" data-testid="tab-create-book-quiz">
              <BookPlus className="mr-2 h-4 w-4" />
              Nova knjiga i kviz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-6">
            <TabQuizEdits />
          </TabsContent>
          <TabsContent value="create" className="mt-6">
            <TabCreateQuiz />
          </TabsContent>
          <TabsContent value="book-quiz" className="mt-6">
            <TabCreateBookAndQuiz />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
