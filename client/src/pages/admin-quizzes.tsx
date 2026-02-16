import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Quiz, Book, Question } from "@shared/schema";
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
import { Plus, Trash2, Pencil, FileQuestion } from "lucide-react";

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
  correctAnswer: z.enum(["a", "b", "c", "d"], { required_error: "Točan odgovor je obavezan" }),
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
              <TableHead>Točan odgovor</TableHead>
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
                  <FormLabel>Točan odgovor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-correct-answer">
                        <SelectValue placeholder="Odaberite točan odgovor" />
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

export default function AdminQuizzes() {
  const { toast } = useToast();
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
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

  function getBookTitle(bookId: string): string {
    const book = books?.find((b) => b.id === bookId);
    return book?.title ?? "Nepoznata knjiga";
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-quizzes-title">Upravljanje kvizovima</h1>
          </div>
          <Button onClick={() => { form.reset({ title: "", bookId: "" }); setQuizDialogOpen(true); }} data-testid="button-add-quiz">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj kviz
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            {quizzesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : quizzes && quizzes.length > 0 ? (
              <Accordion type="multiple">
                {quizzes.map((quiz) => (
                  <AccordionItem key={quiz.id} value={quiz.id}>
                    <AccordionTrigger className="gap-2" data-testid={`accordion-quiz-${quiz.id}`}>
                      <div className="flex items-center gap-3 flex-wrap text-left flex-1">
                        <span className="font-medium">{quiz.title}</span>
                        <Badge variant="secondary">{getBookTitle(quiz.bookId)}</Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0 ml-2"
                        onClick={(e) => { e.stopPropagation(); setDeleteQuiz(quiz); }}
                        data-testid={`button-delete-quiz-${quiz.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AccordionTrigger>
                    <AccordionContent>
                      <QuizQuestions quizId={quiz.id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nema kvizova. Dodajte prvi kviz.</p>
            )}
          </CardContent>
        </Card>

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
