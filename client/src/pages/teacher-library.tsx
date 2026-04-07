import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, FileText, PlusCircle, Trash2, Send, CheckCircle2, Clock, Lock } from "lucide-react";
import type { Book, Quiz } from "@shared/schema";
import { BookCover } from "@/components/book-cover";
import { AgeGroupBadge } from "@/components/age-group-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuizEditInfo {
  quizId: string;
  teacherEditStatus: "none" | "pending" | "approved";
  teacherEditorId: string | null;
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

export default function TeacherLibrary() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: bookQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/books", selectedBook?.id, "quizzes"],
    enabled: !!selectedBook,
  });

  const quiz = bookQuizzes?.[0];

  const { data: editInfo, isLoading: editInfoLoading } = useQuery<QuizEditInfo>({
    queryKey: ["/api/teacher/quizzes", quiz?.id, "edit-info"],
    enabled: !!quiz?.id && editModalOpen,
    queryFn: async () => {
      const res = await fetch(`/api/teacher/quizzes/${quiz!.id}/edit-info`, { credentials: "include" });
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/teacher/quizzes/${quiz!.id}/submit-questions`, { questions });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Uspješno poslano!", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/quizzes", quiz?.id, "edit-info"] });
      setEditModalOpen(false);
      setQuestions([emptyQuestion()]);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const filtered = books?.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  function openEditModal(book: Book) {
    setSelectedBook(book);
    setQuestions([emptyQuestion()]);
    setEditModalOpen(true);
  }

  function closeModal() {
    setEditModalOpen(false);
    setSelectedBook(null);
    setQuestions([emptyQuestion()]);
  }

  function updateQuestion(idx: number, field: keyof QuestionDraft, value: string) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
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
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-library-title">Biblioteka</h1>
          <p className="text-muted-foreground">Pregledajte dostupne knjige i dodajte pitanja kvizovima.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pretraži knjige..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-books"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-md" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Nema knjiga</p>
            <p className="text-muted-foreground">
              {search ? "Nema rezultata za vašu pretragu." : "Knjige još nisu dodane."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((book) => (
              <Card key={book.id} className="h-full" data-testid={`card-book-${book.id}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="aspect-[2/3] w-full rounded-md bg-muted flex items-center justify-center overflow-hidden" data-testid={`img-book-cover-${book.id}`}>
                    <BookCover title={book.title} author={book.author} ageGroup={book.ageGroup} coverImage={book.coverImage} />
                  </div>
                  <div>
                    <h3 className="font-semibold line-clamp-2" data-testid={`text-book-title-${book.id}`}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AgeGroupBadge ageGroup={book.ageGroup} />
                    <Badge variant="outline">
                      <FileText className="mr-1" />
                      {book.pageCount} str.
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => openEditModal(book)}
                    data-testid={`button-edit-quiz-${book.id}`}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Dodaj pitanja kvizu
                  </Button>
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
              {selectedBook?.title} — Možete dodati 1–5 pitanja koja admin mora odobriti.
            </DialogDescription>
          </DialogHeader>

          {editInfoLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : !quiz ? (
            <div className="py-6 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-8 w-8" />
              <p>Ova knjiga još nema kviz. Kviz mora postojati da biste dodali pitanja.</p>
            </div>
          ) : editInfo?.teacherEditStatus === "approved" ? (
            <div className="py-6 text-center">
              <Lock className="mx-auto mb-3 h-8 w-8 text-green-600" />
              <p className="font-medium text-green-700">Kviz je zaključan — izmjene su već odobrene.</p>
              {editInfo.approvedTeacherName && (
                <p className="text-sm text-muted-foreground mt-1">Odobrio/la: {editInfo.approvedTeacherName}</p>
              )}
            </div>
          ) : editInfo?.teacherEditStatus === "pending" ? (
            <div className="py-6 text-center">
              <Clock className="mx-auto mb-3 h-8 w-8 text-amber-500" />
              <p className="font-medium text-amber-700">Vaše izmjene čekaju odobrenje admina.</p>
              <p className="text-sm text-muted-foreground mt-1">Dodali ste {editInfo.teacherAddedQuestionsCount} pitanje(a).</p>
            </div>
          ) : (
            <>
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
                        placeholder="Unesite pitanje..."
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
                      <Select
                        value={q.correctAnswer}
                        onValueChange={(val) => updateQuestion(idx, "correctAnswer", val)}
                      >
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
            </>
          )}

          {quiz && !editInfoLoading && editInfo?.canEdit && (
            <p className="text-xs text-muted-foreground text-center pb-1">
              <CheckCircle2 className="inline mr-1 h-3 w-3 text-green-600" />
              Kviz ID: {quiz.id} · Pitanja čekaju admin pregled prije aktivacije
            </p>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
