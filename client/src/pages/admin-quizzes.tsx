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
import { Plus, Trash2, Pencil, FileQuestion, Download, Upload, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle } from "lucide-react";

const quizFormSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  bookId: z.string().min(1, "Knjiga je obavezna"),
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
  const [sortField, setSortField] = useState<"title" | "book" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<QuizWithCount[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { title: "", bookId: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuizFormValues) => {
      await apiRequest("POST", "/api/quizzes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Kviz dodan", description: "Novi kviz je uspješno kreiran." });
      setQuizDialogOpen(false);
      form.reset();
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
      const { quizzesCreated, questionsCreated, errors } = result;

      const successMessage = `Uvezeno ${quizzesCreated} kvizova i ${questionsCreated} pitanja`;
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

  function getBookTitle(bookId: string): string {
    const book = books?.find((b) => b.id === bookId);
    return book?.title ?? "Nepoznata knjiga";
  }

  function toggleSort(field: "title" | "book") {
    if (sortField === field) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  }

  const filteredQuizzes = useMemo(() => {
    if (!quizzes) return [];
    let result = quizzes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          getBookTitle(quiz.bookId).toLowerCase().includes(q)
      );
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = sortField === "book" ? getBookTitle(a.bookId).toLowerCase() : a.title.toLowerCase();
        const valB = sortField === "book" ? getBookTitle(b.bookId).toLowerCase() : b.title.toLowerCase();
        return sortDir === "asc" ? valA.localeCompare(valB, "hr") : valB.localeCompare(valA, "hr");
      });
    }
    return result;
  }, [quizzes, searchQuery, books, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / QUIZZES_PER_PAGE));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const paginatedQuizzes = filteredQuizzes.slice(
    (safePage - 1) * QUIZZES_PER_PAGE,
    safePage * QUIZZES_PER_PAGE
  );

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
            <Button onClick={() => { form.reset({ title: "", bookId: "" }); setQuizDialogOpen(true); }} data-testid="button-add-quiz">
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

        <Card>
          <CardContent className="p-4">
            {quizzesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : paginatedQuizzes.length > 0 ? (
              <div className="space-y-0">
                <div className="flex items-center gap-3 px-4 py-2 border-b text-sm text-muted-foreground">
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
                  <div className="w-10"></div>
                </div>
                <Accordion type="multiple">
                  {paginatedQuizzes.map((quiz) => (
                    <AccordionItem key={quiz.id} value={quiz.id} className="relative">
                      <div className="flex items-center">
                        <AccordionTrigger className="gap-2 flex-1" data-testid={`accordion-quiz-${quiz.id}`}>
                          <div className="flex items-center gap-3 text-left flex-1">
                            <span className="font-medium flex-1">{quiz.title}</span>
                            <Badge variant="secondary" className="w-48 justify-center truncate">{getBookTitle(quiz.bookId)}</Badge>
                            <Badge variant="outline" className="w-24 justify-center" data-testid={`text-question-count-${quiz.id}`}>
                              <HelpCircle className="h-3 w-3 mr-1" />
                              {quiz.questionCount ?? "?"} pitanja
                            </Badge>
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

        <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novi kviz</DialogTitle>
              <DialogDescription>Unesite podatke za novi kviz.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naslov kviza</FormLabel>
                    <FormControl><Input {...field} data-testid="input-quiz-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bookId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Knjiga</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-quiz-book">
                          <SelectValue placeholder="Odaberite knjigu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {books?.map((book) => (
                          <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-quiz">
                    {createMutation.isPending ? "Spremanje..." : "Dodaj kviz"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
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
      </div>
    </DashboardLayout>
  );
}
