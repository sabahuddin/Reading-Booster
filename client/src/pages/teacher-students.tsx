import { useState, useMemo } from "react";
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Star, Eye, Trophy, Target, UserPlus, Download, Copy, Check, KeyRound,
  UsersRound, Pencil, Trash2, FolderOpen, Plus, X, BarChart3, ArrowUpDown, BookOpen,
} from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type StudentUser = Omit<User, "password">;

type SortKey = "name-asc" | "name-desc" | "points-desc" | "points-asc" | "odjeljenje-asc" | "accuracy-desc";

const createStudentSchema = z.object({
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
  classroomId: z.string().min(1, "Odjeljenje je obavezno"),
  ageGroup: z.string().optional(),
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

interface ClassroomStat {
  id: string;
  name: string;
  description?: string;
  studentCount: number;
  totalPoints: number;
  avgPoints: number;
  quizCount: number;
  accuracy: number;
  students: Array<StudentUser & { quizCount: number; accuracy: number }>;
}

interface TeacherAnalytics {
  classrooms: ClassroomStat[];
  totals: {
    studentCount: number;
    totalPoints: number;
    avgPoints: number;
    quizCount: number;
    accuracy: number;
  };
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold">{value}{sub}</p>
    </div>
  );
}

function StudentResultsDialog({ student, open, onClose }: { student: StudentUser; open: boolean; onClose: () => void }) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", student.id],
    enabled: open,
  });

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-student-name">Rezultati: {student.fullName}</DialogTitle>
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
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !results || results.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Učenik još nema rezultata.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Knjiga</TableHead>
                <TableHead>Tačno</TableHead>
                <TableHead>Netačno</TableHead>
                <TableHead>Bodovi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                  <TableCell className="font-medium">{(r as any).bookTitle || "Nepoznato"}</TableCell>
                  <TableCell><Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge></TableCell>
                  <TableCell>{r.wrongAnswers}</TableCell>
                  <TableCell><Badge variant="default">{r.score}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CredentialsDisplay({ items, title, open, onClose }: { items: CreatedStudentResult[]; title: string; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  function copyAll() {
    const text = items.map((s) => `${s.fullName} | ${s.username} | ${s.generatedPassword}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Zapišite ili kopirajte podatke za prijavu. Lozinke se ne mogu ponovo pregledati.</p>
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

function ResetPasswordDialog({ result, open, onClose }: { result: ResetPasswordResult | null; open: boolean; onClose: () => void }) {
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
        <DialogHeader><DialogTitle>Nova lozinka</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">Nova lozinka za <strong>{result.fullName}</strong>:</p>
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

function BulkAddDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (results: CreatedStudentResult[]) => void }) {
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
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const filledCount = names.filter((n) => n.trim().length >= 2).length;

  function handleSubmit() {
    const validNames = names.filter((n) => n.trim().length >= 2);
    if (validNames.length === 0) { toast({ title: "Unesite barem jedno ime", variant: "destructive" }); return; }
    bulkMutation.mutate(validNames);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Dodaj više učenika odjednom</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Unesite ime i prezime svakog učenika. Korisničko ime i lozinka će biti automatski generirani.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{i + 1}.</span>
              <Input
                placeholder="Ime i prezime"
                value={name}
                onChange={(e) => setNames((prev) => { const next = [...prev]; next[i] = e.target.value; return next; })}
                data-testid={`input-bulk-student-${i}`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">Popunjeno: <strong>{filledCount}</strong> / {BULK_ROWS}</p>
          <Button onClick={handleSubmit} disabled={filledCount === 0 || bulkMutation.isPending} data-testid="button-submit-bulk-students">
            {bulkMutation.isPending ? "Kreiranje..." : `Kreiraj ${filledCount} računa`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OdjeljenjeDetailDialog({ classroom, open, onClose }: { classroom: ClassroomStat | null; open: boolean; onClose: () => void }) {
  const [sort, setSort] = useState<SortKey>("points-desc");
  if (!classroom) return null;

  const sorted = [...classroom.students].sort((a, b) => {
    if (sort === "name-asc") return a.fullName.localeCompare(b.fullName);
    if (sort === "name-desc") return b.fullName.localeCompare(a.fullName);
    if (sort === "points-asc") return a.points - b.points;
    if (sort === "accuracy-desc") return b.accuracy - a.accuracy;
    return b.points - a.points;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            {classroom.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y">
          <StatCard label="Učenika" value={classroom.studentCount} icon={Users} />
          <StatCard label="Avg. bodova" value={classroom.avgPoints} icon={Star} />
          <StatCard label="Kvizova" value={classroom.quizCount} icon={BookOpen} />
          <StatCard label="Tačnost" value={classroom.accuracy} icon={Target} sub="%" />
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>Nema učenika u ovom odjeljenju.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-48 h-8 text-xs" data-testid="select-sort-odjeljenje-detail">
                  <SelectValue placeholder="Sortiranje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points-desc">Bodovi ↓</SelectItem>
                  <SelectItem value="points-asc">Bodovi ↑</SelectItem>
                  <SelectItem value="name-asc">Ime A-Z</SelectItem>
                  <SelectItem value="name-desc">Ime Z-A</SelectItem>
                  <SelectItem value="accuracy-desc">Tačnost ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime i prezime</TableHead>
                  <TableHead>Bodovi</TableHead>
                  <TableHead>Kvizova</TableHead>
                  <TableHead>Tačnost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s) => (
                  <TableRow key={s.id} data-testid={`row-odjeljenje-student-${s.id}`}>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell><Badge variant="default">{s.points}</Badge></TableCell>
                    <TableCell>{s.quizCount}</TableCell>
                    <TableCell>{s.accuracy}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
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
  const [editClassName, setEditClassName] = useState("");
  const [deleteStudent, setDeleteStudent] = useState<StudentUser | null>(null);
  const [classroomDialogOpen, setClassroomDialogOpen] = useState(false);
  const [classroomName, setClassroomName] = useState("");
  const [classroomDesc, setClassroomDesc] = useState("");
  const [selectedOdjeljenje, setSelectedOdjeljenje] = useState<ClassroomStat | null>(null);
  const [studentSort, setStudentSort] = useState<SortKey>("name-asc");

  const form = useForm<CreateStudentValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: { fullName: "", classroomId: "", ageGroup: "R1" },
  });

  const { data: students, isLoading } = useQuery<StudentUser[]>({
    queryKey: ["/api/teacher/students"],
  });

  const { data: classrooms = [], isLoading: classroomsLoading } = useQuery<any[]>({
    queryKey: ["/api/teacher/classrooms"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<TeacherAnalytics>({
    queryKey: ["/api/teacher/analytics"],
  });

  const createClassroomMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const res = await apiRequest("POST", "/api/teacher/classrooms", { name, description });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/analytics"] });
      setClassroomDialogOpen(false);
      setClassroomName("");
      setClassroomDesc("");
      toast({ title: "Odjeljenje kreirano" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const deleteClassroomMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/teacher/classrooms/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/analytics"] });
      toast({ title: "Odjeljenje obrisano" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateStudentValues) => {
      const res = await apiRequest("POST", "/api/teacher/create-student", data);
      return res.json();
    },
    onSuccess: (data: CreatedStudentResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/analytics"] });
      setCreateOpen(false);
      setCreatedStudent(data);
      form.reset({ fullName: "", classroomId: "", ageGroup: "R1" });
      toast({ title: "Učenički račun kreiran" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await apiRequest("POST", "/api/teacher/reset-student-password", { studentId });
      return res.json();
    },
    onSuccess: (data: ResetPasswordResult) => { setResetResult(data); toast({ title: "Lozinka resetovana" }); },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, fullName, className }: { id: string; fullName: string; className: string }) => {
      const res = await apiRequest("PUT", `/api/teacher/update-student/${id}`, { fullName, className });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      setEditStudent(null);
      setEditName("");
      setEditClassName("");
      toast({ title: "Učenik uspješno ažuriran" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/teacher/delete-student/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/analytics"] });
      setDeleteStudent(null);
      toast({ title: "Učenik uspješno obrisan" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const sortedStudents = useMemo(() => {
    if (!students) return [];
    const classroomNameById = Object.fromEntries(classrooms.map((c: any) => [c.id, c.name]));
    return [...students].sort((a, b) => {
      const aOdj = (a as any).classroomId ? (classroomNameById[(a as any).classroomId] || "") : "";
      const bOdj = (b as any).classroomId ? (classroomNameById[(b as any).classroomId] || "") : "";
      if (studentSort === "name-asc") return a.fullName.localeCompare(b.fullName);
      if (studentSort === "name-desc") return b.fullName.localeCompare(a.fullName);
      if (studentSort === "points-asc") return a.points - b.points;
      if (studentSort === "odjeljenje-asc") return aOdj.localeCompare(bOdj);
      return b.points - a.points;
    });
  }, [students, studentSort, classrooms]);

  const totals = analytics?.totals;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-students-title">Učenici</h1>
            <p className="text-muted-foreground">Upravljajte učenicima i pratite njihov napredak.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.open("/api/teacher/export", "_blank")} data-testid="button-export-csv">
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

        {/* Ukupna statistika */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Ukupno učenika", value: totals?.studentCount ?? (students?.length ?? 0), icon: Users },
            { label: "Prosjek bodova", value: totals?.avgPoints ?? 0, icon: Target },
            { label: "Ukupno kvizova", value: totals?.quizCount ?? 0, icon: BookOpen },
            { label: "Tačnost", value: `${totals?.accuracy ?? 0}%`, icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {isLoading || analyticsLoading ? <Skeleton className="h-8 w-20" /> : (
                  <div className="text-3xl font-bold">{value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Odjeljenja */}
        <Card data-testid="card-classrooms">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
              Odjeljenja
            </CardTitle>
            <Button size="sm" onClick={() => setClassroomDialogOpen(true)} data-testid="button-create-classroom">
              <Plus className="mr-1 h-4 w-4" />
              Novo odjeljenje
            </Button>
          </CardHeader>
          <CardContent>
            {classroomsLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
            ) : classrooms.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p>Nemate kreiranih odjeljenja.</p>
                <p className="mt-1">Kreirajte odjeljenje da biste mogli dodavati učenike.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(analytics?.classrooms || classrooms).map((c: any) => {
                  const stat = analytics?.classrooms.find((ac) => ac.id === c.id);
                  return (
                    <div key={c.id} className="border rounded-lg p-4 flex flex-col gap-3" data-testid={`card-classroom-${c.id}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{c.name}</span>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0"
                          onClick={() => deleteClassroomMutation.mutate(c.id)}
                          disabled={deleteClassroomMutation.isPending}
                          title="Obriši odjeljenje"
                          data-testid={`button-delete-classroom-${c.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                      {stat ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" /><span>{stat.studentCount} učenika</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3" /><span>{stat.avgPoints} avg</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-3 w-3" /><span>{stat.quizCount} kvizova</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-3 w-3" /><span>{stat.accuracy}% tačnost</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{c.studentCount ?? 0} učenika</span>
                        </div>
                      )}
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setSelectedOdjeljenje(stat || null)}
                        disabled={!stat}
                        data-testid={`button-view-classroom-${c.id}`}
                      >
                        Analitika odjeljenja
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popis svih učenika */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Popis svih učenika</CardTitle>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={studentSort} onValueChange={(v) => setStudentSort(v as SortKey)}>
                <SelectTrigger className="w-48 h-8 text-xs" data-testid="select-sort-students">
                  <SelectValue placeholder="Sortiranje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Ime A-Z</SelectItem>
                  <SelectItem value="name-desc">Ime Z-A</SelectItem>
                  <SelectItem value="points-desc">Bodovi ↓</SelectItem>
                  <SelectItem value="points-asc">Bodovi ↑</SelectItem>
                  <SelectItem value="odjeljenje-asc">Odjeljenje A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !students || students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema učenika. Kreirajte odjeljenje, pa dodajte učenike.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Odjeljenje</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.map((s) => {
                    const odj = classrooms.find((c: any) => c.id === (s as any).classroomId);
                    return (
                      <TableRow key={s.id} data-testid={`row-student-${s.id}`}>
                        <TableCell className="font-medium">{s.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{s.username}</TableCell>
                        <TableCell>
                          {odj
                            ? <Badge variant="outline">{odj.name}</Badge>
                            : <span className="text-muted-foreground text-sm">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="default"><Star className="mr-1 h-3 w-3" />{s.points}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(s)} title="Pogledaj rezultate" data-testid={`button-view-results-${s.id}`}><Eye /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditStudent(s); setEditName(s.fullName); setEditClassName(s.className || ""); }} title="Uredi učenika" data-testid={`button-edit-student-${s.id}`}><Pencil /></Button>
                            <Button variant="ghost" size="icon" onClick={() => resetPasswordMutation.mutate(s.id)} disabled={resetPasswordMutation.isPending} title="Resetuj lozinku" data-testid={`button-reset-password-${s.id}`}><KeyRound /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteStudent(s)} title="Obriši učenika" data-testid={`button-delete-student-${s.id}`}><Trash2 className="text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialozi */}
        {selectedStudent && (
          <StudentResultsDialog student={selectedStudent} open={!!selectedStudent} onClose={() => setSelectedStudent(null)} />
        )}

        <OdjeljenjeDetailDialog classroom={selectedOdjeljenje} open={!!selectedOdjeljenje} onClose={() => setSelectedOdjeljenje(null)} />

        {/* Kreiraj učenika */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj učenika</DialogTitle>
            </DialogHeader>
            {classrooms.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Nema odjeljenja. Morate prvo kreirati odjeljenje prije dodavanja učenika.</p>
                <Button onClick={() => { setCreateOpen(false); setClassroomDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Kreiraj odjeljenje
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Unesite podatke učenika. Korisničko ime i lozinka će biti automatski generirani.
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                    <FormField control={form.control} name="classroomId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Odjeljenje <span className="text-destructive">*</span></FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-create-student-classroom">
                              <SelectValue placeholder="Odaberi odjeljenje" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classrooms.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ime i prezime <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="npr. Amina Hadžić" data-testid="input-create-student-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="ageGroup" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starosna grupa</FormLabel>
                        <Select value={field.value || "R1"} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-create-student-age-group">
                              <SelectValue placeholder="Odaberi grupu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="R1">R1 — 1.–3. razred (6–9 god)</SelectItem>
                            <SelectItem value="R4">R4 — 4.–6. razred (10–12 god)</SelectItem>
                            <SelectItem value="R7">R7 — 7.–9. razred (13–15 god)</SelectItem>
                            <SelectItem value="O">O — Omladina (15–18 god)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-create-student">
                      {createMutation.isPending ? "Kreiranje..." : "Kreiraj račun"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </DialogContent>
        </Dialog>

        {createdStudent && (
          <CredentialsDisplay items={[createdStudent]} title="Učenički račun kreiran" open={!!createdStudent} onClose={() => setCreatedStudent(null)} />
        )}

        <BulkAddDialog open={bulkOpen} onClose={() => setBulkOpen(false)} onSuccess={(results) => setBulkResults(results)} />

        {bulkResults.length > 0 && (
          <CredentialsDisplay items={bulkResults} title={`Kreirano ${bulkResults.length} učenika`} open={bulkResults.length > 0} onClose={() => setBulkResults([])} />
        )}

        <ResetPasswordDialog result={resetResult} open={!!resetResult} onClose={() => setResetResult(null)} />

        {/* Uredi učenika */}
        <Dialog open={!!editStudent} onOpenChange={(v) => { if (!v) { setEditStudent(null); setEditName(""); setEditClassName(""); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Uredi učenika</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ime i prezime</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ime i prezime" data-testid="input-edit-student-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Razred (tekstualno)</label>
                <Input value={editClassName} onChange={(e) => setEditClassName(e.target.value)} placeholder="npr. 5a, 6b, 7c..." data-testid="input-edit-student-class" />
              </div>
              <Button
                className="w-full"
                onClick={() => editStudent && editMutation.mutate({ id: editStudent.id, fullName: editName, className: editClassName })}
                disabled={editMutation.isPending || editName.trim().length < 2}
                data-testid="button-submit-edit-student"
              >
                {editMutation.isPending ? "Spremam..." : "Spremi izmjene"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Briši učenika */}
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

        {/* Kreiraj odjeljenje */}
        <Dialog open={classroomDialogOpen} onOpenChange={(v) => { if (!v) { setClassroomDialogOpen(false); setClassroomName(""); setClassroomDesc(""); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Kreiraj novo odjeljenje</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Naziv odjeljenja <span className="text-destructive">*</span></label>
                <Input
                  value={classroomName}
                  onChange={(e) => setClassroomName(e.target.value)}
                  placeholder="npr. 5a, 6b, Kombinovani 3-4..."
                  data-testid="input-classroom-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Opis (opciono)</label>
                <Input
                  value={classroomDesc}
                  onChange={(e) => setClassroomDesc(e.target.value)}
                  placeholder="Kratki opis odjeljenja..."
                  data-testid="input-classroom-description"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createClassroomMutation.mutate({ name: classroomName, description: classroomDesc })}
                disabled={createClassroomMutation.isPending || classroomName.trim().length < 1}
                data-testid="button-submit-classroom"
              >
                {createClassroomMutation.isPending ? "Kreiranje..." : "Kreiraj odjeljenje"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
