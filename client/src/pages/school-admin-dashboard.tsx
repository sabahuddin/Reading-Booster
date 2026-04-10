import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, UserPlus, Trash2, GraduationCap, BookOpen, BarChart3, Copy, Pencil,
  RefreshCw, Search, Printer, FolderOpen, ArrowRightLeft, ArrowUpDown, Star, Target,
} from "lucide-react";

type SortKey = "name-asc" | "name-desc" | "points-desc" | "points-asc" | "odjeljenje-asc" | "accuracy-desc" | "students-desc";

interface Teacher {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  className: string | null;
  maxStudentAccounts: number;
  studentCount: number;
  classroomCount: number;
  totalPoints: number;
  avgPoints: number;
  quizCount: number;
  accuracy: number;
}

interface ClassroomStat {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  totalPoints: number;
  avgPoints: number;
  quizCount: number;
  accuracy: number;
  students: StudentDetail[];
}

interface StudentDetail {
  id: string;
  fullName: string;
  username: string;
  className: string | null;
  points: number;
  ageGroup: string | null;
  classroomId: string | null;
  quizCount: number;
  accuracy: number;
}

interface StudentWithTeacher {
  id: string;
  fullName: string;
  username: string;
  className: string | null;
  points: number;
  ageGroup: string | null;
  teacherName: string;
  teacherId: string;
  classroomId: string | null;
}

interface SchoolAnalytics {
  teachers: Teacher[];
  classrooms: ClassroomStat[];
}

interface SchoolStats {
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  totalPoints: number;
  totalQuizzes: number;
  avgPoints: number;
}

const emptyTeacherForm = { fullName: "", username: "", password: "", email: "", className: "", maxStudentAccounts: "30" };

function SortSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48 h-8 text-xs" data-testid="select-sort">
          <SelectValue placeholder="Sortiranje" />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold">{value}{sub}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function SchoolAdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState(emptyTeacherForm);
  const [editForm, setEditForm] = useState({ fullName: "", className: "", maxStudentAccounts: "" });
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [moveStudentDialog, setMoveStudentDialog] = useState<StudentWithTeacher | null>(null);
  const [moveToClassroom, setMoveToClassroom] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedOdjeljenje, setSelectedOdjeljenje] = useState<ClassroomStat | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithTeacher | null>(null);
  const [teacherSort, setTeacherSort] = useState<SortKey>("name-asc");
  const [odjeljenjeSort, setOdjeljenjeSort] = useState<SortKey>("name-asc");
  const [studentSort, setStudentSort] = useState<SortKey>("name-asc");

  const { data: stats, isLoading: statsLoading } = useQuery<SchoolStats>({
    queryKey: ["/api/school/stats"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<SchoolAnalytics>({
    queryKey: ["/api/school-admin/analytics"],
  });

  const { data: rawTeachers, isLoading: teachersLoading } = useQuery<any[]>({
    queryKey: ["/api/school-admin/teachers"],
  });

  const { data: classrooms = [] } = useQuery<any[]>({
    queryKey: ["/api/school-admin/classrooms"],
  });

  const { data: rawStudents, isLoading: studentsLoading } = useQuery<StudentWithTeacher[]>({
    queryKey: ["/api/school-admin/students"],
  });

  const teachers: Teacher[] = useMemo(() => {
    if (!rawTeachers) return [];
    return rawTeachers.map(t => {
      const stat = analytics?.teachers.find(at => at.id === t.id);
      return { ...t, studentCount: stat?.studentCount ?? 0, classroomCount: stat?.classroomCount ?? 0, totalPoints: stat?.totalPoints ?? 0, avgPoints: stat?.avgPoints ?? 0, quizCount: stat?.quizCount ?? 0, accuracy: stat?.accuracy ?? 0 };
    });
  }, [rawTeachers, analytics]);

  const analyticsClassrooms: ClassroomStat[] = analytics?.classrooms || [];

  const students: StudentWithTeacher[] = useMemo(() => {
    if (!rawStudents) return [];
    return rawStudents.map(s => {
      const stat = analyticsClassrooms.flatMap(c => c.students).find(cs => cs.id === s.id);
      return { ...s, quizCount: stat?.quizCount ?? 0, accuracy: stat?.accuracy ?? 0 } as any;
    });
  }, [rawStudents, analyticsClassrooms]);

  const moveStudentMutation = useMutation({
    mutationFn: async ({ studentId, classroomId }: { studentId: string; classroomId: string }) => {
      const res = await apiRequest("PUT", "/api/school-admin/move-student", { studentId, classroomId: classroomId || null });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/analytics"] });
      setMoveStudentDialog(null);
      setMoveToClassroom("");
      toast({ title: "Učenik premješten u drugo odjeljenje" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: typeof newTeacher) => {
      const res = await apiRequest("POST", "/api/school-admin/create-teacher", { ...data, maxStudentAccounts: Number(data.maxStudentAccounts) || 30 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/analytics"] });
      setGeneratedCredentials({ username: newTeacher.username, password: newTeacher.password });
      setNewTeacher(emptyTeacherForm);
      toast({ title: "Učitelj kreiran uspješno" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
      const res = await apiRequest("PUT", `/api/school-admin/update-teacher/${id}`, { ...data, maxStudentAccounts: Number(data.maxStudentAccounts) || 0 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school/stats"] });
      toast({ title: "Učitelj ažuriran" });
      setEditTeacher(null);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => { await apiRequest("DELETE", `/api/school-admin/delete-teacher/${teacherId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/analytics"] });
      toast({ title: "Učitelj i njegovi učenici su obrisani" });
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function generateUsername(fullName: string): string {
    const clean = fullName.toLowerCase().replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "dj").replace(/[^a-z0-9]/g, "");
    return clean + Math.floor(Math.random() * 100);
  }

  function generatePassword(): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ", lower = "abcdefghjkmnpqrstuvwxyz", digits = "23456789";
    const all = upper + lower + digits;
    let pwd = upper[Math.floor(Math.random() * upper.length)] + digits[Math.floor(Math.random() * digits.length)];
    for (let i = 0; i < 8; i++) pwd += all[Math.floor(Math.random() * all.length)];
    return pwd.split("").sort(() => Math.random() - 0.5).join("");
  }

  function openEditDialog(teacher: Teacher) {
    setEditTeacher(teacher);
    setEditForm({ fullName: teacher.fullName, className: teacher.className || "", maxStudentAccounts: String(teacher.maxStudentAccounts || 30) });
  }

  const maxTeachers = user?.maxTeacherAccounts || 10;
  const currentTeacherCount = teachers.length;
  const totalLicencesUsed = teachers.reduce((sum, t) => sum + (t.maxStudentAccounts || 0), 0);
  const totalLicencesAvail = user?.maxStudentAccounts || 200;

  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => {
      if (teacherSort === "name-asc") return a.fullName.localeCompare(b.fullName);
      if (teacherSort === "name-desc") return b.fullName.localeCompare(a.fullName);
      if (teacherSort === "students-desc") return b.studentCount - a.studentCount;
      if (teacherSort === "points-desc") return b.totalPoints - a.totalPoints;
      if (teacherSort === "accuracy-desc") return b.accuracy - a.accuracy;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [teachers, teacherSort]);

  const sortedOdjeljenja = useMemo(() => {
    return [...analyticsClassrooms].sort((a, b) => {
      if (odjeljenjeSort === "name-asc") return a.name.localeCompare(b.name);
      if (odjeljenjeSort === "name-desc") return b.name.localeCompare(a.name);
      if (odjeljenjeSort === "students-desc") return b.studentCount - a.studentCount;
      if (odjeljenjeSort === "points-desc") return b.totalPoints - a.totalPoints;
      if (odjeljenjeSort === "accuracy-desc") return b.accuracy - a.accuracy;
      return a.name.localeCompare(b.name);
    });
  }, [analyticsClassrooms, odjeljenjeSort]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    let filtered = students;
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      filtered = students.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        (s.className || "").toLowerCase().includes(q) ||
        s.teacherName.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const aOdj = analyticsClassrooms.find(c => c.id === a.classroomId)?.name || "";
      const bOdj = analyticsClassrooms.find(c => c.id === b.classroomId)?.name || "";
      if (studentSort === "name-asc") return a.fullName.localeCompare(b.fullName);
      if (studentSort === "name-desc") return b.fullName.localeCompare(a.fullName);
      if (studentSort === "odjeljenje-asc") return aOdj.localeCompare(bOdj);
      if (studentSort === "points-asc") return a.points - b.points;
      if (studentSort === "accuracy-desc") return ((b as any).accuracy ?? 0) - ((a as any).accuracy ?? 0);
      return b.points - a.points;
    });
  }, [students, studentSearch, studentSort, analyticsClassrooms]);

  return (
    <DashboardLayout role="school_admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-school-admin-title">
              {stats?.schoolName || user?.schoolName || "Škola"} — Upravljanje
            </h1>
            <p className="text-muted-foreground">Upravljajte učiteljima i pratite napredak škole</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.open("/print?tip=skola", "_blank")} data-testid="button-print-school">
            <Printer className="h-4 w-4 mr-2" />
            Printaj izvještaj
          </Button>
        </div>

        {/* Stat kartice */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats.totalTeachers, label: "Učitelja", icon: Users, color: "text-blue-500" },
              { value: stats.totalStudents, label: "Učenika", icon: GraduationCap, color: "text-green-500" },
              { value: stats.totalQuizzes, label: "Kvizova", icon: BookOpen, color: "text-orange-500" },
              { value: stats.avgPoints, label: "Prosjek bodova", icon: BarChart3, color: "text-purple-500" },
            ].map(({ value, label, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-3 pt-6">
                  <Icon className={`h-8 w-8 ${color}`} />
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Licence */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted border text-sm flex-wrap">
          <span className="font-medium">Licence za učenike:</span>
          <span>
            <strong className={totalLicencesUsed > totalLicencesAvail ? "text-destructive" : "text-green-600"}>
              {totalLicencesUsed}
            </strong>
            {" / "}{totalLicencesAvail} dodijeljenih učiteljima
          </span>
          <span className="text-muted-foreground">•</span>
          <span>Učitelji: <strong>{currentTeacherCount}</strong> / {maxTeachers}</span>
        </div>

        <Tabs defaultValue="teachers">
          <TabsList>
            <TabsTrigger value="teachers" data-testid="tab-teachers">
              Učitelji ({currentTeacherCount})
            </TabsTrigger>
            <TabsTrigger value="odjeljenja" data-testid="tab-odjeljenja">
              Odjeljenja ({analyticsClassrooms.length})
            </TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">
              Učenici ({students?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* ===== UČITELJI ===== */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2 flex-wrap">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lista učitelja
                </CardTitle>
                <div className="flex items-center gap-2">
                  <SortSelect
                    value={teacherSort}
                    onChange={(v) => setTeacherSort(v as SortKey)}
                    options={[
                      { value: "name-asc", label: "Ime A-Z" },
                      { value: "name-desc", label: "Ime Z-A" },
                      { value: "students-desc", label: "Učenika ↓" },
                      { value: "points-desc", label: "Bodova ↓" },
                      { value: "accuracy-desc", label: "Tačnost ↓" },
                    ]}
                  />
                  <Button
                    onClick={() => { setNewTeacher(emptyTeacherForm); setGeneratedCredentials(null); setShowAddDialog(true); }}
                    disabled={currentTeacherCount >= maxTeachers}
                    size="sm"
                    data-testid="button-add-teacher"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Dodaj učitelja
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {teachersLoading || analyticsLoading ? (
                  <div className="p-6 space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : sortedTeachers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ime i prezime</TableHead>
                        <TableHead>Učenika</TableHead>
                        <TableHead>Odjeljenja</TableHead>
                        <TableHead>Ukupno bodova</TableHead>
                        <TableHead>Kvizova</TableHead>
                        <TableHead>Tačnost</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTeachers.map(teacher => (
                        <TableRow
                          key={teacher.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedTeacher(teacher)}
                          data-testid={`row-teacher-${teacher.id}`}
                        >
                          <TableCell className="font-medium" data-testid={`text-teacher-name-${teacher.id}`}>
                            {teacher.fullName}
                            <p className="text-xs text-muted-foreground">{teacher.username}</p>
                          </TableCell>
                          <TableCell><Badge variant="outline">{teacher.studentCount}</Badge></TableCell>
                          <TableCell><Badge variant="outline">{teacher.classroomCount}</Badge></TableCell>
                          <TableCell className="font-bold text-orange-600">{teacher.totalPoints}</TableCell>
                          <TableCell>{teacher.quizCount}</TableCell>
                          <TableCell>
                            <Badge variant={teacher.accuracy >= 70 ? "default" : "secondary"}>
                              {teacher.accuracy}%
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(teacher)} data-testid={`button-edit-teacher-${teacher.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(teacher)} data-testid={`button-delete-teacher-${teacher.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Još nema učitelja</p>
                    <p className="text-sm">Kliknite "Dodaj učitelja" da kreirate prvi račun</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ODJELJENJA ===== */}
          <TabsContent value="odjeljenja">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2 flex-wrap">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Sva odjeljenja škole
                </CardTitle>
                <SortSelect
                  value={odjeljenjeSort}
                  onChange={(v) => setOdjeljenjeSort(v as SortKey)}
                  options={[
                    { value: "name-asc", label: "Naziv A-Z" },
                    { value: "name-desc", label: "Naziv Z-A" },
                    { value: "students-desc", label: "Učenika ↓" },
                    { value: "points-desc", label: "Bodova ↓" },
                    { value: "accuracy-desc", label: "Tačnost ↓" },
                  ]}
                />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
                  </div>
                ) : sortedOdjeljenja.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Nema odjeljenja — učitelji ih kreiraju u svom panelu</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {sortedOdjeljenja.map(c => (
                      <div
                        key={c.id}
                        className="border rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:border-primary/60 transition-colors"
                        onClick={() => setSelectedOdjeljenje(c)}
                        data-testid={`card-odjeljenje-${c.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.teacherName}</p>
                          </div>
                          <Badge variant="outline">{c.studentCount} učen.</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Star className="h-3 w-3" />{c.avgPoints} avg</div>
                          <div className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.quizCount} kvizova</div>
                          <div className="flex items-center gap-1 col-span-2"><Target className="h-3 w-3" />{c.accuracy}% tačnost</div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-auto" onClick={(e) => { e.stopPropagation(); setSelectedOdjeljenje(c); }}>
                          Detalji odjeljenja
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== UČENICI ===== */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Svi učenici škole
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SortSelect
                      value={studentSort}
                      onChange={(v) => setStudentSort(v as SortKey)}
                      options={[
                        { value: "name-asc", label: "Ime A-Z" },
                        { value: "name-desc", label: "Ime Z-A" },
                        { value: "odjeljenje-asc", label: "Odjeljenje A-Z" },
                        { value: "points-desc", label: "Bodovi ↓" },
                        { value: "points-asc", label: "Bodovi ↑" },
                        { value: "accuracy-desc", label: "Tačnost ↓" },
                      ]}
                    />
                    <div className="relative w-56">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pretraži..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                        data-testid="input-search-students"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {studentsLoading ? (
                  <div className="p-6 space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : filteredStudents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ime i prezime</TableHead>
                        <TableHead>Odjeljenje</TableHead>
                        <TableHead>Bodovi</TableHead>
                        <TableHead>Kvizova</TableHead>
                        <TableHead>Tačnost</TableHead>
                        <TableHead>Učitelj</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => {
                        const odj = analyticsClassrooms.find(c => c.id === student.classroomId);
                        return (
                          <TableRow
                            key={student.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedStudent(student)}
                            data-testid={`row-student-${student.id}`}
                          >
                            <TableCell className="font-medium">{student.fullName}</TableCell>
                            <TableCell>
                              {odj ? <Badge variant="outline">{odj.name}</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                            </TableCell>
                            <TableCell className="font-bold text-orange-600">{student.points}</TableCell>
                            <TableCell>{(student as any).quizCount ?? 0}</TableCell>
                            <TableCell>{(student as any).accuracy ?? 0}%</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{student.teacherName}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost" size="icon" title="Premjesti u odjeljenje"
                                onClick={() => { setMoveStudentDialog(student); setMoveToClassroom(student.classroomId || ""); }}
                                data-testid={`button-move-student-${student.id}`}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>{studentSearch ? "Nema rezultata za pretragu" : "Nema učenika — učitelji ih dodaju"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ===== MODAL: Detalji učitelja ===== */}
        <Dialog open={!!selectedTeacher} onOpenChange={(v) => !v && setSelectedTeacher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {selectedTeacher?.fullName}
              </DialogTitle>
              <DialogDescription>{selectedTeacher?.username} · {selectedTeacher?.email || "Bez emaila"}</DialogDescription>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border rounded-lg px-4">
                  <MiniStat label="Učenika" value={selectedTeacher.studentCount} />
                  <MiniStat label="Odjeljenja" value={selectedTeacher.classroomCount} />
                  <MiniStat label="Kvizova" value={selectedTeacher.quizCount} />
                  <MiniStat label="Tačnost" value={selectedTeacher.accuracy} sub="%" />
                </div>
                <div className="grid grid-cols-2 gap-4 border rounded-lg px-4 py-3">
                  <MiniStat label="Ukupno bodova" value={selectedTeacher.totalPoints} />
                  <MiniStat label="Prosjek bodova" value={selectedTeacher.avgPoints} />
                </div>
                <div className="text-sm text-muted-foreground space-y-1 border rounded-lg px-4 py-3">
                  <p>Razred(i): <span className="text-foreground font-medium">{selectedTeacher.className || "—"}</span></p>
                  <p>Licence za učenike: <span className="text-foreground font-medium">{selectedTeacher.maxStudentAccounts}</span></p>
                </div>
                <div className="text-xs text-muted-foreground">Kliknite na red učitelja u tabeli za pregled. Za editovanje ili brisanje koristite akcije u tabeli.</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ===== MODAL: Detalji odjeljenja ===== */}
        <Dialog open={!!selectedOdjeljenje} onOpenChange={(v) => !v && setSelectedOdjeljenje(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                {selectedOdjeljenje?.name}
              </DialogTitle>
              <DialogDescription>Učitelj: {selectedOdjeljenje?.teacherName}</DialogDescription>
            </DialogHeader>
            {selectedOdjeljenje && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border rounded-lg px-4">
                  <MiniStat label="Učenika" value={selectedOdjeljenje.studentCount} />
                  <MiniStat label="Avg. bodova" value={selectedOdjeljenje.avgPoints} />
                  <MiniStat label="Kvizova" value={selectedOdjeljenje.quizCount} />
                  <MiniStat label="Tačnost" value={selectedOdjeljenje.accuracy} sub="%" />
                </div>
                {selectedOdjeljenje.students.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    <p>Nema učenika u ovom odjeljenju.</p>
                  </div>
                ) : (
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
                      {selectedOdjeljenje.students
                        .sort((a, b) => b.points - a.points)
                        .map(s => (
                          <TableRow key={s.id} data-testid={`row-odj-student-${s.id}`}>
                            <TableCell className="font-medium">{s.fullName}</TableCell>
                            <TableCell><Badge variant="default">{s.points}</Badge></TableCell>
                            <TableCell>{s.quizCount}</TableCell>
                            <TableCell>{s.accuracy}%</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ===== MODAL: Detalji učenika ===== */}
        <Dialog open={!!selectedStudent} onOpenChange={(v) => !v && setSelectedStudent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {selectedStudent?.fullName}
              </DialogTitle>
              <DialogDescription>{selectedStudent?.username}</DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-3 gap-4 border rounded-lg px-4 py-3">
                  <MiniStat label="Bodovi" value={selectedStudent.points} />
                  <MiniStat label="Kvizova" value={(selectedStudent as any).quizCount ?? 0} />
                  <MiniStat label="Tačnost" value={(selectedStudent as any).accuracy ?? 0} sub="%" />
                </div>
                <div className="text-sm text-muted-foreground space-y-1 border rounded-lg px-4 py-3">
                  <p>Odjeljenje: <span className="text-foreground font-medium">{analyticsClassrooms.find(c => c.id === selectedStudent.classroomId)?.name || "—"}</span></p>
                  <p>Razred: <span className="text-foreground font-medium">{selectedStudent.className || "—"}</span></p>
                  <p>Starosna grupa: <span className="text-foreground font-medium">{selectedStudent.ageGroup || "—"}</span></p>
                  <p>Učitelj: <span className="text-foreground font-medium">{selectedStudent.teacherName}</span></p>
                </div>
                <Button
                  variant="outline" className="w-full"
                  onClick={() => { setMoveStudentDialog(selectedStudent); setMoveToClassroom(selectedStudent.classroomId || ""); setSelectedStudent(null); }}
                  data-testid="button-move-from-detail"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Premjesti u drugo odjeljenje
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Premještanje učenika */}
        <Dialog open={!!moveStudentDialog} onOpenChange={(v) => { if (!v) { setMoveStudentDialog(null); setMoveToClassroom(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Premjesti učenika u odjeljenje</DialogTitle>
              <DialogDescription>Odaberite odjeljenje za <strong>{moveStudentDialog?.fullName}</strong>.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Select value={moveToClassroom} onValueChange={setMoveToClassroom}>
                <SelectTrigger data-testid="select-move-classroom">
                  <SelectValue placeholder="Odaberi odjeljenje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Ukloni iz odjeljenja —</SelectItem>
                  {analyticsClassrooms.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.teacherName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={() => moveStudentDialog && moveStudentMutation.mutate({ studentId: moveStudentDialog.id, classroomId: moveToClassroom })}
                disabled={moveStudentMutation.isPending}
                data-testid="button-confirm-move-student"
              >
                {moveStudentMutation.isPending ? "Premještam..." : "Premjesti"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dodaj učitelja */}
        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setGeneratedCredentials(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novog učitelja</DialogTitle>
              <DialogDescription>Kreirajte račun za nastavnika vaše škole.</DialogDescription>
            </DialogHeader>
            {generatedCredentials ? (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-800 dark:text-green-200 mb-3">Učitelj je uspješno kreiran!</p>
                  <div className="space-y-2 text-sm">
                    {[["Korisničko ime:", generatedCredentials.username], ["Lozinka:", generatedCredentials.password]].map(([label, val]) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-1 font-mono font-bold">
                          {val}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(val); toast({ title: "Kopirano!" }); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-3 text-muted-foreground">Zapišite i proslijedite ove podatke učitelju.</p>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setGeneratedCredentials(null)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Dodaj još jednog
                  </Button>
                  <Button onClick={() => { setShowAddDialog(false); setGeneratedCredentials(null); }}>Zatvori</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="py-2 space-y-4">
                <div>
                  <label className="text-sm font-medium">Ime i prezime *</label>
                  <Input value={newTeacher.fullName} onChange={e => setNewTeacher(p => ({ ...p, fullName: e.target.value }))} placeholder="Npr. Amina Hodžić" data-testid="input-new-teacher-name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Odjeljenje/Razred(i)</label>
                    <Input value={newTeacher.className} onChange={e => setNewTeacher(p => ({ ...p, className: e.target.value }))} placeholder="Npr. 4a, 4b" data-testid="input-new-teacher-class" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Broj licenci za učenike</label>
                    <Input type="number" min={1} max={totalLicencesAvail} value={newTeacher.maxStudentAccounts} onChange={e => setNewTeacher(p => ({ ...p, maxStudentAccounts: e.target.value }))} data-testid="input-new-teacher-licenses" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={newTeacher.email} onChange={e => setNewTeacher(p => ({ ...p, email: e.target.value }))} placeholder="email@skola.ba" data-testid="input-new-teacher-email" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Korisničko ime *</label>
                    <Input value={newTeacher.username} onChange={e => setNewTeacher(p => ({ ...p, username: e.target.value }))} placeholder="korisnicko.ime" data-testid="input-new-teacher-username" />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => { const u = generateUsername(newTeacher.fullName); const p = generatePassword(); setNewTeacher(prev => ({ ...prev, username: u, password: p })); }} disabled={!newTeacher.fullName} data-testid="button-auto-generate">
                    <RefreshCw className="h-4 w-4 mr-1" />Auto
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Lozinka *</label>
                  <Input value={newTeacher.password} onChange={e => setNewTeacher(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 znakova, 1 veliko slovo, 1 broj" data-testid="input-new-teacher-password" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Otkaži</Button>
                  <Button onClick={() => createTeacherMutation.mutate(newTeacher)} disabled={createTeacherMutation.isPending || !newTeacher.fullName || !newTeacher.username || !newTeacher.password} data-testid="button-confirm-create-teacher">
                    {createTeacherMutation.isPending ? "Kreiranje..." : "Kreiraj učitelja"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Uredi učitelja */}
        <Dialog open={!!editTeacher} onOpenChange={(open) => !open && setEditTeacher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uredi učitelja</DialogTitle>
              <DialogDescription>Izmijeni podatke za {editTeacher?.fullName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Ime i prezime</label>
                <Input value={editForm.fullName} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))} data-testid="input-edit-teacher-name" />
              </div>
              <div>
                <label className="text-sm font-medium">Odjeljenje/Razred(i)</label>
                <Input value={editForm.className} onChange={e => setEditForm(p => ({ ...p, className: e.target.value }))} placeholder="Npr. 5a, 5b" data-testid="input-edit-teacher-class" />
              </div>
              <div>
                <label className="text-sm font-medium">Broj licenci za učenike</label>
                <Input type="number" min={0} max={totalLicencesAvail} value={editForm.maxStudentAccounts} onChange={e => setEditForm(p => ({ ...p, maxStudentAccounts: e.target.value }))} data-testid="input-edit-teacher-licenses" />
                <p className="text-xs text-muted-foreground mt-1">Maksimalan dozvoljeni broj: {totalLicencesAvail}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTeacher(null)}>Otkaži</Button>
              <Button onClick={() => editTeacher && updateTeacherMutation.mutate({ id: editTeacher.id, data: editForm })} disabled={updateTeacherMutation.isPending || !editForm.fullName} data-testid="button-confirm-edit-teacher">
                {updateTeacherMutation.isPending ? "Spremanje..." : "Spremi promjene"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Brisanje učitelja */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Obriši učitelja?</AlertDialogTitle>
              <AlertDialogDescription>
                Brisat ćete učitelja <strong>{deleteConfirm?.fullName}</strong> i sve učenike koje je kreirao/la. Ova radnja je nepovratna.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-teacher">Otkaži</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteConfirm && deleteTeacherMutation.mutate(deleteConfirm.id)} disabled={deleteTeacherMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete-teacher">
                {deleteTeacherMutation.isPending ? "Brisanje..." : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
