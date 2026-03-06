import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Quiz, Book, Question } from "@shared/schema";

type QuizWithCount = Quiz & { questionCount?: number };
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, FileQuestion, Download, Upload, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle, Sparkles, ShieldAlert } from "lucide-react";

const quizFormSchema = z.object({
  bookId: z.string().min(1, "Knjiga je obavezna"),
  quizAuthor: z.string().optional(),
});

const questionFormSchema = z.object({
  questionText: z.string().min(1, "Tekst pitanja je obavezan"),
  optionA: z.string().min(1, "Opcija A je obavezna"),
  optionB: z.string().min(1, "Opcija B je obavezna"),
  optionC: z.string().min(1, "Opcija C je obavezna"),
  optionD: z.string().min(1, "Opcija D je obavezna"),
  correctAnswer: z.enum(["a", "b", "c", "d"], { required_error: "Tačan odgovor je obavezan" }),
  points: z.coerce.number().min(1, "Bodovi moraju biti barem 1"),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;
type QuestionFormValues = z.infer<typeof questionFormSchema>;

function QuizQuestions({ quizId }: { quizId: string }) {
  const { toast } = useToast();
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/quizzes", quizId, "questions"],
  });

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "a", points: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      await apiRequest("POST", "/api/questions", { ...data, quizId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes", quizId, "questions"] });
      toast({ title: "Pitanje dodano", description: "Novo pitanje je uspješno kreirano." });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      await apiRequest("PUT", `/api/questions/${editingQuestion!.id}`, { ...data, quizId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes", quizId, "questions"] });
      toast({ title: "Pitanje ažurirano", description: "Promjene su uspješno spremljene." });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes", quizId, "questions"] });
      toast({ title: "Pitanje obrisano" });
      setDeleteQuestion(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  function openCreate() {
    setEditingQuestion(null);
    form.reset({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "a", points: 1 });
    setQuestionDialogOpen(true);
  }

  function openEdit(q: Question) {
    setEditingQuestion(q);
    form.reset({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer as "a" | "b" | "c" | "d",
      points: q.points,
    });
    setQuestionDialogOpen(true);
  }

  function closeDialog() {
    setQuestionDialogOpen(false);
    setEditingQuestion(null);
    form.reset();
  }

  function onSubmit(values: QuestionFormValues) {
    if (editingQuestion) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
  }

  const answerLabels: Record<string, string> = { a: "A", b: "B", c: "C", d: "D" };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">{questions?.length ?? 0} pitanja</span>
        <Button size="sm" onClick={openCreate} data-testid={`button-add-question-${quizId}`}>
          <Plus className="mr-1 h-3 w-3" />
          Dodaj pitanje
        </Button>
      </div>

      {questions && questions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pitanje</TableHead>
              <TableHead>Tačan odgovor</TableHead>
              <TableHead>Bodovi</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id} data-testid={`row-question-${q.id}`}>
                <TableCell className="font-medium max-w-xs truncate">{q.questionText}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{answerLabels[q.correctAnswer]}</Badge>
                </TableCell>
                <TableCell>{q.points}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(q)} data-testid={`button-edit-question-${q.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteQuestion(q)} data-testid={`button-delete-question-${q.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Nema pitanja. Dodajte prvo pitanje.</p>
      )}

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Uredi pitanje" : "Dodaj novo pitanje"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Izmijenite podatke o pitanju." : "Unesite podatke za novo pitanje."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="questionText" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst pitanja</FormLabel>
                  <FormControl><Input {...field} data-testid="input-question-text" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="optionA" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opcija A</FormLabel>
                  <FormControl><Input {...field} data-testid="input-option-a" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="optionB" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opcija B</FormLabel>
                  <FormControl><Input {...field} data-testid="input-option-b" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="optionC" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opcija C</FormLabel>
                  <FormControl><Input {...field} data-testid="input-option-c" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="optionD" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opcija D</FormLabel>
                  <FormControl><Input {...field} data-testid="input-option-d" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="correctAnswer" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tačan odgovor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-correct-answer">
                        <SelectValue placeholder="Odaberite tačan odgovor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="a">A</SelectItem>
                      <SelectItem value="b">B</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="d">D</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="points" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bodovi</FormLabel>
                  <FormControl><Input type="number" {...field} data-testid="input-question-points" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={isPending} data-testid="button-submit-question">
                  {isPending ? "Spremanje..." : editingQuestion ? "Spremi promjene" : "Dodaj pitanje"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteQuestion} onOpenChange={(open) => !open && setDeleteQuestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>Ova radnja je nepovratna. Pitanje će biti trajno obrisano.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-question">Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuestion && deleteMutation.mutate(deleteQuestion.id)}
              data-testid="button-confirm-delete-question"
            >
              {deleteMutation.isPending ? "Brisanje..." : "Obriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const QUIZZES_PER_PAGE = 20;

export default function AdminQuizzes() {
  const { toast } = useToast();
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [deleteQuiz, setDeleteQuiz] = useState<QuizWithCount | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"title" | "book" | "createdAt" | null>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiBookId, setAiBookId] = useState("");
  const [aiBookSearch, setAiBookSearch] = useState("");
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [cleanupPreview, setCleanupPreview] = useState<{ id: string; title: string; age_group: string; question_count: number; minimum_required: number }[]>([]);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<QuizWithCount[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const [addQuizBookSearch, setAddQuizBookSearch] = useState("");
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [wizardBookId, setWizardBookId] = useState("");
  const [wizardAuthor, setWizardAuthor] = useState("");
  const [wizardQuestions, setWizardQuestions] = useState<QuestionFormValues[]>([]);
  const [editingWizardIdx, setEditingWizardIdx] = useState<number | null>(null);

  const wizardQuestionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "a", points: 1 },
  });

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { bookId: "", quizAuthor: "" },
  });

  function resetWizard() {
    setWizardStep(1);
    setWizardBookId("");
    setWizardAuthor("");
    setWizardQuestions([]);
    setEditingWizardIdx(null);
    setAddQuizBookSearch("");
    wizardQuestionForm.reset();
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const bookTitle = bookMap.get(wizardBookId) || "Nepoznata knjiga";
      await apiRequest("POST", "/api/quizzes", {
        bookId: wizardBookId,
        title: `Kviz: ${bookTitle}`,
        quizAuthor: wizardAuthor || undefined,
        questions: wizardQuestions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Kviz dodan", description: `Kviz sa ${wizardQuestions.length} pitanja je uspješno kreiran.` });
      setQuizDialogOpen(false);
      resetWizard();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/quizzes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Kviz obrisan" });
      setDeleteQuiz(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await apiRequest("POST", "/api/admin/generate-quiz", { bookId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "AI kviz generisan", description: data.message });
      setAiDialogOpen(false);
      setAiBookId("");
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const booksWithoutQuiz = useMemo(() => {
    if (!books || !quizzes) return [];
    const bookIdsWithQuiz = new Set(quizzes.map(q => q.bookId));
    return books.filter(b => !bookIdsWithQuiz.has(b.id));
  }, [books, quizzes]);

  function downloadTemplate() {
    window.open("/api/admin/templates/quizzes", "_blank");
  }

  async function handleImportCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("csv", file);

      const response = await fetch("/api/admin/import/quizzes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Greška pri uvozu",
          description: error.message || "Došlo je do greške pri uvozu CSV datoteke.",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      const { quizzesCreated, questionsAdded, errors } = result;

      const successMessage = `Uvezeno ${quizzesCreated} novih kvizova, ${questionsAdded} pitanja dodano`;
      const description = errors && errors.length > 0 ? errors.join("; ") : undefined;

      toast({
        title: "Uvoz je uspješan",
        description: description ? `${successMessage}\n\nGreške: ${description}` : successMessage,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Nepoznata greška";
      toast({
        title: "Greška pri uvozu",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const bookMap = useMemo(() => {
    const map = new Map<string, string>();
    if (books) {
      for (const b of books) {
        map.set(b.id, b.title);
      }
    }
    return map;
  }, [books]);

  function getBookTitle(bookId: string): string {
    return bookMap.get(bookId) ?? "Nepoznata knjiga";
  }

  function toggleSort(field: "title" | "book" | "createdAt") {
    if (sortField === field) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "createdAt" ? "desc" : "asc");
    }
    setCurrentPage(1);
  }

  function fmtDate(d: string | Date | null | undefined): string {
    if (!d) return "—";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
  }

  const filteredQuizzes = useMemo(() => {
    if (!quizzes) return [];
    let result = quizzes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          (bookMap.get(quiz.bookId) ?? "").toLowerCase().includes(q) ||
          (quiz.quizAuthor ?? "").toLowerCase().includes(q)
      );
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        if (sortField === "createdAt") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return sortDir === "asc" ? tA - tB : tB - tA;
        }
        const valA = sortField === "book" ? (bookMap.get(a.bookId) ?? "").toLowerCase() : a.title.toLowerCase();
        const valB = sortField === "book" ? (bookMap.get(b.bookId) ?? "").toLowerCase() : b.title.toLowerCase();
        return sortDir === "asc" ? valA.localeCompare(valB, "hr") : valB.localeCompare(valA, "hr");
      });
    }
    return result;
  }, [quizzes, searchQuery, bookMap, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / QUIZZES_PER_PAGE));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const paginatedQuizzes = filteredQuizzes.slice(
    (safePage - 1) * QUIZZES_PER_PAGE,
    safePage * QUIZZES_PER_PAGE
  );

  const bulkAiGenerateMutation = useMutation({
    mutationFn: async (bookIds: string[]) => {
      const res = await apiRequest("POST", "/api/admin/generate-quizzes-bulk", { bookIds });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ 
        title: "Bulk AI generisanje završeno", 
        description: `Uspješno: ${data.success}, Neuspješno: ${data.failed}` 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/cleanup-quizzes");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Čišćenje završeno", description: data.message });
      setCleanupDialogOpen(false);
      setCleanupPreview([]);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  function toggleQuizSelection(quizId: string) {
    setSelectedQuizIds(prev => {
      const next = new Set(prev);
      if (next.has(quizId)) next.delete(quizId); else next.add(quizId);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    const pageIds = paginatedQuizzes.map(q => q.id);
    const allSelected = pageIds.every(id => selectedQuizIds.has(id));
    setSelectedQuizIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("POST", "/api/admin/quizzes/bulk-delete", { quizIds: ids });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Kvizovi obrisani", description: data.message });
      setSelectedQuizIds(new Set());
      setBulkDeleteConfirm(false);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  async function openCleanupDialog() {
    setCleanupLoading(true);
    try {
      const res = await fetch("/api/admin/cleanup-quizzes-preview", { credentials: "include" });
      const data = await res.json();
      setCleanupPreview(data.quizzes || []);
      setCleanupDialogOpen(true);
    } catch {
      toast({ title: "Greška", description: "Nije moguće dohvatiti pregled.", variant: "destructive" });
    } finally {
      setCleanupLoading(false);
    }
  }

  const handleBulkGenerate = () => {
    const ids = booksWithoutQuiz.slice(0, 5).map(b => b.id); // Limit to 5 at a time to avoid timeout
    if (ids.length === 0) {
      toast({ title: "Nema knjiga", description: "Sve knjige već imaju kvizove." });
      return;
    }
    bulkAiGenerateMutation.mutate(ids);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-quizzes-title">Upravljanje kvizovima</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleBulkGenerate}
              variant="secondary"
              disabled={bulkAiGenerateMutation.isPending || booksWithoutQuiz.length === 0}
              data-testid="button-bulk-ai-generate"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {bulkAiGenerateMutation.isPending ? "Generišem (batch 5)..." : `Bulk AI (${booksWithoutQuiz.length})`}
            </Button>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              data-testid="button-download-quizzes-template"
            >
              <Download className="mr-2 h-4 w-4" />
              Preuzmi šablon
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isImporting}
              data-testid="button-import-quizzes-csv"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Uvozim..." : "Uvezi CSV"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              data-testid="input-import-quizzes-file"
            />
            <Button
              onClick={() => { setAiBookId(""); setAiBookSearch(""); setAiDialogOpen(true); }}
              variant="outline"
              data-testid="button-ai-generate-quiz"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generiraj kviz
            </Button>
            <Button
              onClick={openCleanupDialog}
              variant="destructive"
              disabled={cleanupLoading}
              data-testid="button-cleanup-quizzes"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              {cleanupLoading ? "Učitavam..." : "Počisti ispod standarda"}
            </Button>
            <Button onClick={() => { resetWizard(); setQuizDialogOpen(true); }} data-testid="button-add-quiz">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj kviz
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po naslovu kviza ili knjige..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9"
            data-testid="input-search-quizzes"
          />
        </div>

        {selectedQuizIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <span className="text-sm font-medium">{selectedQuizIds.size} {selectedQuizIds.size === 1 ? "kviz označen" : "kviza označeno"}</span>
            <Button size="sm" variant="ghost" onClick={() => setSelectedQuizIds(new Set())} data-testid="button-clear-quiz-selection">
              Poništi
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteConfirm(true)}
              data-testid="button-bulk-delete-quizzes"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Obriši označene
            </Button>
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            {quizzesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : paginatedQuizzes.length > 0 ? (
              <div className="space-y-0">
                <div className="flex items-center gap-3 px-4 py-2 border-b text-sm text-muted-foreground">
                  <Checkbox
                    checked={paginatedQuizzes.length > 0 && paginatedQuizzes.every(q => selectedQuizIds.has(q.id))}
                    onCheckedChange={toggleSelectAllOnPage}
                    data-testid="checkbox-select-all-quizzes"
                  />
                  <div className="flex-1">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => toggleSort("title")}
                      data-testid="button-sort-quiz-title"
                    >
                      Naslov kviza
                      {sortField === "title" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                  </div>
                  <div className="w-48">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => toggleSort("book")}
                      data-testid="button-sort-quiz-book"
                    >
                      Knjiga
                      {sortField === "book" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                  </div>
                  <div className="w-24 text-center">Pitanja</div>
                  <div className="w-28">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => toggleSort("createdAt")}
                      data-testid="button-sort-quiz-created"
                    >
                      Dodano
                      {sortField === "createdAt" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                  </div>
                  <div className="w-10"></div>
                </div>
                <Accordion type="multiple">
                  {paginatedQuizzes.map((quiz) => (
                    <AccordionItem key={quiz.id} value={quiz.id} className={`relative ${selectedQuizIds.has(quiz.id) ? "bg-destructive/5" : ""}`}>
                      <div className="flex items-center">
                        <div className="pl-4 pr-2 flex items-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedQuizIds.has(quiz.id)}
                            onCheckedChange={() => toggleQuizSelection(quiz.id)}
                            data-testid={`checkbox-quiz-${quiz.id}`}
                          />
                        </div>
                        <AccordionTrigger className="gap-2 flex-1" data-testid={`accordion-quiz-${quiz.id}`}>
                          <div className="flex items-center gap-3 text-left flex-1">
                            <span className="font-medium flex-1">
                              {quiz.title}
                              {quiz.quizAuthor && <span className="text-xs text-muted-foreground ml-2">({quiz.quizAuthor})</span>}
                            </span>
                            <Badge variant="secondary" className="w-48 justify-center truncate">{getBookTitle(quiz.bookId)}</Badge>
                            <Badge variant="outline" className="w-24 justify-center" data-testid={`text-question-count-${quiz.id}`}>
                              <HelpCircle className="h-3 w-3 mr-1" />
                              {quiz.questionCount ?? "?"} pitanja
                            </Badge>
                            <span className="w-28 text-xs text-muted-foreground text-left" data-testid={`text-quiz-created-${quiz.id}`}>
                              {fmtDate(quiz.createdAt)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <div
                          role="button"
                          tabIndex={0}
                          className="shrink-0 p-2 rounded-md hover:bg-accent cursor-pointer mr-2"
                          onClick={() => setDeleteQuiz(quiz)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDeleteQuiz(quiz); }}
                          data-testid={`button-delete-quiz-${quiz.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </div>
                      </div>
                      <AccordionContent>
                        <QuizQuestions quizId={quiz.id} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? "Nema rezultata za vašu pretragu." : "Nema kvizova. Dodajte prvi kviz."}
              </p>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground" data-testid="text-quizzes-count">
              Prikazano {(safePage - 1) * QUIZZES_PER_PAGE + 1}-{Math.min(safePage * QUIZZES_PER_PAGE, filteredQuizzes.length)} od {filteredQuizzes.length} kvizova
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      variant={safePage === p ? "default" : "outline"}
                      onClick={() => setCurrentPage(p as number)}
                      data-testid={`button-page-${p}`}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                size="icon"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={quizDialogOpen} onOpenChange={(open) => { if (!open) resetWizard(); setQuizDialogOpen(open); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dodaj novi kviz {wizardStep === 2 && `— Kviz: ${bookMap.get(wizardBookId) || ""}`}</DialogTitle>
              <DialogDescription>
                {wizardStep === 1 ? "Korak 1: Odaberite knjigu i autora kviza." : `Korak 2: Dodajte pitanja (${wizardQuestions.length} dodano).`}
              </DialogDescription>
            </DialogHeader>

            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Knjiga</label>
                  <div className="space-y-2 mt-1">
                    <Input
                      placeholder="Pretraži knjige po naslovu ili autoru..."
                      value={addQuizBookSearch}
                      onChange={(e) => setAddQuizBookSearch(e.target.value)}
                      data-testid="input-add-quiz-book-search"
                    />
                    {wizardBookId && (
                      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                        <span className="text-sm font-medium flex-1">Kviz: {bookMap.get(wizardBookId) || ""}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setWizardBookId("")} data-testid="button-clear-book">✕</Button>
                      </div>
                    )}
                    {!wizardBookId && (
                      <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                        {(books || [])
                          .filter(b => {
                            if (!addQuizBookSearch.trim()) return true;
                            const q = addQuizBookSearch.toLowerCase();
                            return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
                          })
                          .slice(0, 50)
                          .map(b => (
                            <button key={b.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => { setWizardBookId(b.id); setAddQuizBookSearch(""); }} data-testid={`option-book-${b.id}`}>
                              <span className="font-medium">{b.title}</span>
                              <span className="text-muted-foreground ml-2">— {b.author}</span>
                            </button>
                          ))
                        }
                        {books && addQuizBookSearch.trim() && (books.filter(b => { const q = addQuizBookSearch.toLowerCase(); return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q); }).length === 0) && (
                          <p className="px-3 py-2 text-sm text-muted-foreground">Nema rezultata.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Autor kviza (opcionalno)</label>
                  <Input value={wizardAuthor} onChange={(e) => setWizardAuthor(e.target.value)} placeholder="npr. Ime učitelja ili Citanje.ba" className="mt-1" data-testid="input-quiz-author" />
                </div>
                <DialogFooter>
                  <Button disabled={!wizardBookId} onClick={() => setWizardStep(2)} data-testid="button-wizard-next">
                    Dalje — Dodaj pitanja
                  </Button>
                </DialogFooter>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                {wizardQuestions.length > 0 && (
                  <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                    {wizardQuestions.map((q, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm">
                        <span className="font-medium text-muted-foreground w-6">{i + 1}.</span>
                        <span className="flex-1 truncate">{q.questionText}</span>
                        <Badge variant="secondary" className="text-xs">{q.correctAnswer.toUpperCase()}</Badge>
                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                          setEditingWizardIdx(i);
                          wizardQuestionForm.reset(wizardQuestions[i]);
                        }} data-testid={`button-edit-wq-${i}`}><Pencil className="h-3 w-3" /></Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                          setWizardQuestions(prev => prev.filter((_, j) => j !== i));
                          if (editingWizardIdx === i) { setEditingWizardIdx(null); wizardQuestionForm.reset(); }
                        }} data-testid={`button-delete-wq-${i}`}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                  <p className="text-sm font-medium">{editingWizardIdx !== null ? `Uredi pitanje ${editingWizardIdx + 1}` : "Novo pitanje"}</p>
                  <Form {...wizardQuestionForm}>
                    <div className="space-y-3">
                      <FormField control={wizardQuestionForm.control} name="questionText" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tekst pitanja</FormLabel>
                          <FormControl><Input {...field} data-testid="input-wq-text" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-2">
                        <FormField control={wizardQuestionForm.control} name="optionA" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">A</FormLabel>
                            <FormControl><Input {...field} data-testid="input-wq-a" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={wizardQuestionForm.control} name="optionB" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">B</FormLabel>
                            <FormControl><Input {...field} data-testid="input-wq-b" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={wizardQuestionForm.control} name="optionC" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">C</FormLabel>
                            <FormControl><Input {...field} data-testid="input-wq-c" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={wizardQuestionForm.control} name="optionD" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">D</FormLabel>
                            <FormControl><Input {...field} data-testid="input-wq-d" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="flex gap-2">
                        <FormField control={wizardQuestionForm.control} name="correctAnswer" render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Tačan odgovor</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger data-testid="select-wq-answer"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="a">A</SelectItem>
                                <SelectItem value="b">B</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="d">D</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={wizardQuestionForm.control} name="points" render={({ field }) => (
                          <FormItem className="w-20">
                            <FormLabel className="text-xs">Bodovi</FormLabel>
                            <FormControl><Input type="number" {...field} data-testid="input-wq-points" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <Button type="button" size="sm" variant="secondary" onClick={wizardQuestionForm.handleSubmit((vals) => {
                        if (editingWizardIdx !== null) {
                          setWizardQuestions(prev => prev.map((q, i) => i === editingWizardIdx ? vals : q));
                          setEditingWizardIdx(null);
                        } else {
                          setWizardQuestions(prev => [...prev, vals]);
                        }
                        wizardQuestionForm.reset({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "a", points: 1 });
                      })} data-testid="button-add-wq">
                        <Plus className="mr-1 h-3 w-3" />
                        {editingWizardIdx !== null ? "Spremi izmjenu" : "Dodaj pitanje"}
                      </Button>
                    </div>
                  </Form>
                </div>

                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setWizardStep(1)} data-testid="button-wizard-back">Nazad</Button>
                  <Button disabled={wizardQuestions.length === 0 || createMutation.isPending} onClick={() => createMutation.mutate()} data-testid="button-submit-quiz">
                    {createMutation.isPending ? "Spremanje..." : `Spremi kviz (${wizardQuestions.length} pitanja)`}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteQuiz} onOpenChange={(open) => !open && setDeleteQuiz(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova radnja je nepovratna. Kviz "{deleteQuiz?.title}" će biti trajno obrisan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-quiz">Odustani</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteQuiz && deleteQuizMutation.mutate(deleteQuiz.id)}
                data-testid="button-confirm-delete-quiz"
              >
                {deleteQuizMutation.isPending ? "Brisanje..." : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Sparkles className="inline mr-2 h-5 w-5" />
                AI Generiraj kviz
              </DialogTitle>
              <DialogDescription>
                Odaberite knjigu. AI će automatski generisati 20 pitanja. Autor kviza: Čitanje
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Pretraži knjige po naslovu ili autoru..."
                value={aiBookSearch}
                onChange={(e) => setAiBookSearch(e.target.value)}
                data-testid="input-ai-book-search"
              />
              {aiBookId && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                  <span className="text-sm font-medium flex-1">Kviz: {bookMap.get(aiBookId) || ""}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAiBookId("")} data-testid="button-clear-ai-book">
                    ✕
                  </Button>
                </div>
              )}
              {!aiBookId && (
                <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                  {booksWithoutQuiz
                    .filter(b => {
                      if (!aiBookSearch.trim()) return true;
                      const q = aiBookSearch.toLowerCase();
                      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
                    })
                    .slice(0, 50)
                    .map(b => (
                      <button
                        key={b.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => { setAiBookId(b.id); setAiBookSearch(""); }}
                        data-testid={`option-ai-book-${b.id}`}
                      >
                        <span className="font-medium">{b.title}</span>
                        <span className="text-muted-foreground ml-2">— {b.author}</span>
                      </button>
                    ))
                  }
                  {booksWithoutQuiz.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Sve knjige već imaju kviz.</p>
                  )}
                  {booksWithoutQuiz.length > 0 && aiBookSearch.trim() && booksWithoutQuiz.filter(b => {
                    const q = aiBookSearch.toLowerCase();
                    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
                  }).length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Nema rezultata.</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => aiBookId && aiGenerateMutation.mutate(aiBookId)}
                disabled={!aiBookId || aiGenerateMutation.isPending}
                data-testid="button-confirm-ai-generate"
              >
                {aiGenerateMutation.isPending ? "Generiram..." : "Generiraj kviz"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk delete selected quizzes */}
        <AlertDialog open={bulkDeleteConfirm} onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Obriši {selectedQuizIds.size} {selectedQuizIds.size === 1 ? "kviz" : "kviza"}?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova radnja je nepovratna. Označeni kvizovi biće trajno obrisani zajedno sa svim pitanjima i rezultatima.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-bulk-delete-quizzes">Odustani</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => bulkDeleteMutation.mutate(Array.from(selectedQuizIds))}
                disabled={bulkDeleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-bulk-delete-quizzes"
              >
                {bulkDeleteMutation.isPending ? "Brišem..." : `Obriši ${selectedQuizIds.size} kvizova`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cleanup under-minimum quizzes dialog */}
        <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                Brisanje kvizova ispod standarda
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Standard minimuma pitanja u bazi: <strong>R1 → 15, R4 → 25, R7/O/A → 30</strong>.
                    Sljedeći kvizovi imaju premalo pitanja i biće trajno obrisani zajedno sa svim pitanjima i rezultatima:
                  </p>
                  {cleanupPreview.length === 0 ? (
                    <p className="text-green-600 font-medium">Svi kvizovi ispunjavaju standard. Nema ništa za brisati.</p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2">Kviz</th>
                            <th className="text-center px-3 py-2">Grupa</th>
                            <th className="text-center px-3 py-2">Ima pitanja</th>
                            <th className="text-center px-3 py-2">Treba min.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {cleanupPreview.map((q) => (
                            <tr key={q.id} className="hover:bg-muted/50">
                              <td className="px-3 py-2">{q.title}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="font-mono font-medium">{q.age_group}</span>
                              </td>
                              <td className="px-3 py-2 text-center text-red-600 font-medium">{q.question_count}</td>
                              <td className="px-3 py-2 text-center text-muted-foreground">{q.minimum_required}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {cleanupPreview.length > 0 && (
                    <p className="text-sm font-semibold text-destructive">
                      Ukupno za brisanje: {cleanupPreview.length} kvizova. Ova akcija je nepovratna.
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-cleanup">Odustani</AlertDialogCancel>
              {cleanupPreview.length > 0 && (
                <AlertDialogAction
                  onClick={() => cleanupMutation.mutate()}
                  disabled={cleanupMutation.isPending}
                  className="bg-destructive hover:bg-destructive/90"
                  data-testid="button-confirm-cleanup"
                >
                  {cleanupMutation.isPending ? "Brišem..." : `Obriši ${cleanupPreview.length} kvizova`}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
