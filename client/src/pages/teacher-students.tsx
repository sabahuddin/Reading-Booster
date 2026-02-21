import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Star, Eye, Trophy, Target, UserPlus, Download, Copy, Check, KeyRound, UsersRound, Pencil, Trash2 } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type StudentUser = Omit<User, "password">;

const createStudentSchema = z.object({
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
});

type CreateStudentValues = z.infer<typeof createStudentSchema>;

interface CreatedStudentResult extends StudentUser {
  generatedPassword: string;
}

interface ResetPasswordResult {
  username: string;
  fullName: string;
  newPassword: string;
}

function StudentResultsDialog({
  student,
  open,
  onClose,
}: {
  student: StudentUser;
  open: boolean;
  onClose: () => void;
}) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", student.id],
    enabled: open,
  });

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(
        results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-student-name">
            Rezultati: {student.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-dialog-quizzes">{totalQuizzes}</p>
            <p className="text-xs text-muted-foreground">Kvizova</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-dialog-score">{totalScore}</p>
            <p className="text-xs text-muted-foreground">Bodova</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-dialog-accuracy">{avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Tačnost</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !results || results.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Učenik još nema rezultata.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kviz</TableHead>
                <TableHead>Tačno</TableHead>
                <TableHead>Netačno</TableHead>
                <TableHead>Bodovi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                  <TableCell className="font-medium">{r.quizId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge>
                  </TableCell>
                  <TableCell>{r.wrongAnswers}</TableCell>
                  <TableCell>
                    <Badge variant="default">{r.score}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CredentialsDisplay({
  items,
  title,
  open,
  onClose,
}: {
  items: CreatedStudentResult[];
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyAll() {
    const text = items
      .map((s) => `${s.fullName} | ${s.username} | ${s.generatedPassword}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Zapišite ili kopirajte podatke za prijavu. Lozinke se ne mogu ponovo pregledati.
          </p>
          <div className="bg-muted p-3 rounded-md space-y-1.5 font-mono text-xs max-h-[40vh] overflow-y-auto">
            {items.map((s) => (
              <div key={s.id} className="flex flex-wrap gap-x-3" data-testid={`text-credentials-${s.id}`}>
                <span className="font-semibold min-w-[120px]">{s.fullName}</span>
                <span>{s.username}</span>
                <span className="font-bold">{s.generatedPassword}</span>
              </div>
            ))}
          </div>
          <Button onClick={copyAll} variant="outline" className="w-full" data-testid="button-copy-all-credentials">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Kopirano!" : "Kopiraj sve podatke"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  result,
  open,
  onClose,
}: {
  result: ResetPasswordResult | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  function copyCredentials() {
    const text = `Korisničko ime: ${result!.username}\nNova lozinka: ${result!.newPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova lozinka</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Nova lozinka za <strong>{result.fullName}</strong>:
          </p>
          <div className="bg-muted p-4 rounded-md space-y-2 font-mono text-sm">
            <p data-testid="text-reset-username">Korisničko ime: <strong>{result.username}</strong></p>
            <p data-testid="text-reset-password">Nova lozinka: <strong>{result.newPassword}</strong></p>
          </div>
          <Button onClick={copyCredentials} variant="outline" className="w-full" data-testid="button-copy-reset-password">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Kopirano!" : "Kopiraj podatke"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const BULK_ROWS = 30;

function BulkAddDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (results: CreatedStudentResult[]) => void;
}) {
  const { toast } = useToast();
  const [names, setNames] = useState<string[]>(Array(BULK_ROWS).fill(""));

  const bulkMutation = useMutation({
    mutationFn: async (studentNames: string[]) => {
      const res = await apiRequest("POST", "/api/teacher/create-students-bulk", { students: studentNames });
      return res.json();
    },
    onSuccess: (data: CreatedStudentResult[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      setNames(Array(BULK_ROWS).fill(""));
      onClose();
      onSuccess(data);
      toast({ title: `${data.length} učenika uspješno kreirano` });
    },
    onError: (err: any) => {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    },
  });

  const filledCount = names.filter((n) => n.trim().length >= 2).length;

  function handleSubmit() {
    const validNames = names.filter((n) => n.trim().length >= 2);
    if (validNames.length === 0) {
      toast({ title: "Unesite barem jedno ime", variant: "destructive" });
      return;
    }
    bulkMutation.mutate(validNames);
  }

  function updateName(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj više učenika odjednom</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Unesite ime i prezime svakog učenika. Korisničko ime i lozinka će biti automatski generirani.
          Popunite samo polja za učenike koje želite dodati.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{i + 1}.</span>
              <Input
                placeholder={`Ime i prezime`}
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                data-testid={`input-bulk-student-${i}`}
                
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Popunjeno: <strong>{filledCount}</strong> / {BULK_ROWS}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={filledCount === 0 || bulkMutation.isPending}
            data-testid="button-submit-bulk-students"
          >
            {bulkMutation.isPending ? "Kreiranje..." : `Kreiraj ${filledCount} računa`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TeacherStudents() {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkResults, setBulkResults] = useState<CreatedStudentResult[]>([]);
  const [createdStudent, setCreatedStudent] = useState<CreatedStudentResult | null>(null);
  const [resetResult, setResetResult] = useState<ResetPasswordResult | null>(null);
  const [editStudent, setEditStudent] = useState<StudentUser | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteStudent, setDeleteStudent] = useState<StudentUser | null>(null);

  const form = useForm<CreateStudentValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: { fullName: "" },
  });

  const { data: students, isLoading } = useQuery<StudentUser[]>({
    queryKey: ["/api/teacher/students"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateStudentValues) => {
      const res = await apiRequest("POST", "/api/teacher/create-student", data);
      return res.json();
    },
    onSuccess: (data: CreatedStudentResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      setCreateOpen(false);
      setCreatedStudent(data);
      form.reset();
      toast({ title: "Učenički račun kreiran" });
    },
    onError: (err: any) => {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await apiRequest("POST", "/api/teacher/reset-student-password", { studentId });
      return res.json();
    },
    onSuccess: (data: ResetPasswordResult) => {
      setResetResult(data);
      toast({ title: "Lozinka resetovana" });
    },
    onError: (err: any) => {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, fullName }: { id: string; fullName: string }) => {
      const res = await apiRequest("PUT", `/api/teacher/update-student/${id}`, { fullName });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      setEditStudent(null);
      setEditName("");
      toast({ title: "Učenik uspješno ažuriran" });
    },
    onError: (err: any) => {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/teacher/delete-student/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      setDeleteStudent(null);
      toast({ title: "Učenik uspješno obrisan" });
    },
    onError: (err: any) => {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    },
  });

  function handleExport() {
    window.open("/api/teacher/export", "_blank");
  }

  const totalStudents = students?.length ?? 0;
  const avgPoints = totalStudents > 0
    ? Math.round(students!.reduce((sum, s) => sum + s.points, 0) / totalStudents)
    : 0;
  const totalPoints = students?.reduce((sum, s) => sum + s.points, 0) ?? 0;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-students-title">Učenici</h1>
            <p className="text-muted-foreground">Upravljajte učenicima i pratite njihov napredak.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-csv">
              <Download className="mr-2 h-4 w-4" />
              Izvezi CSV
            </Button>
            <Button variant="outline" onClick={() => setBulkOpen(true)} data-testid="button-bulk-add">
              <UsersRound className="mr-2 h-4 w-4" />
              Dodaj više (30)
            </Button>
            <Button onClick={() => setCreateOpen(true)} data-testid="button-create-student">
              <UserPlus className="mr-2 h-4 w-4" />
              Dodaj učenika
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno učenika</CardTitle>
              <Users className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-total">{totalStudents}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosječni bodovi</CardTitle>
              <Target className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-avg">{avgPoints}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupni bodovi</CardTitle>
              <Star className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-total-points">{totalPoints}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popis učenika</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !students || students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema učenika. Dodajte prvog učenika.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id} data-testid={`row-student-${s.id}`}>
                      <TableCell className="font-medium">{s.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{s.username}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <Star className="mr-1" />
                          {s.points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedStudent(s)}
                            title="Pogledaj rezultate"
                            data-testid={`button-view-results-${s.id}`}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditStudent(s); setEditName(s.fullName); }}
                            title="Uredi ime"
                            data-testid={`button-edit-student-${s.id}`}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => resetPasswordMutation.mutate(s.id)}
                            disabled={resetPasswordMutation.isPending}
                            title="Resetuj lozinku"
                            data-testid={`button-reset-password-${s.id}`}
                          >
                            <KeyRound />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteStudent(s)}
                            title="Obriši učenika"
                            data-testid={`button-delete-student-${s.id}`}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedStudent && (
          <StudentResultsDialog
            student={selectedStudent}
            open={!!selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj učenika</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Unesite ime i prezime učenika. Korisničko ime i lozinka će biti automatski generirani.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ime i prezime</FormLabel>
                    <FormControl><Input placeholder="npr. Amina Hadžić" data-testid="input-create-student-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-create-student">
                  {createMutation.isPending ? "Kreiranje..." : "Kreiraj račun"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {createdStudent && (
          <CredentialsDisplay
            items={[createdStudent]}
            title="Učenički račun kreiran"
            open={!!createdStudent}
            onClose={() => setCreatedStudent(null)}
          />
        )}

        <BulkAddDialog
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onSuccess={(results) => setBulkResults(results)}
        />

        {bulkResults.length > 0 && (
          <CredentialsDisplay
            items={bulkResults}
            title={`Kreirano ${bulkResults.length} učenika`}
            open={bulkResults.length > 0}
            onClose={() => setBulkResults([])}
          />
        )}

        <ResetPasswordDialog
          result={resetResult}
          open={!!resetResult}
          onClose={() => setResetResult(null)}
        />

        <Dialog open={!!editStudent} onOpenChange={(v) => { if (!v) { setEditStudent(null); setEditName(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uredi učenika</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ime i prezime</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ime i prezime"
                  data-testid="input-edit-student-name"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => editStudent && editMutation.mutate({ id: editStudent.id, fullName: editName })}
                disabled={editMutation.isPending || editName.trim().length < 2}
                data-testid="button-submit-edit-student"
              >
                {editMutation.isPending ? "Spremam..." : "Spremi izmjene"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteStudent} onOpenChange={(v) => { if (!v) setDeleteStudent(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Obriši učenika</AlertDialogTitle>
              <AlertDialogDescription>
                Jeste li sigurni da želite obrisati učenika <strong>{deleteStudent?.fullName}</strong>?
                Ova akcija se ne može poništiti. Svi rezultati kvizova ovog učenika će biti izgubljeni.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Otkaži</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteStudent && deleteMutation.mutate(deleteStudent.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Brišem..." : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
