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
import { Users, UserPlus, Trash2, GraduationCap, BookOpen, BarChart3, Copy, Pencil, RefreshCw, Search } from "lucide-react";

interface Teacher {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  className: string | null;
  maxStudentAccounts: number;
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
}

interface SchoolStats {
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  totalPoints: number;
  totalQuizzes: number;
  avgPoints: number;
  classes: Array<{ name: string; students: number; points: number; quizzes: number }>;
  topStudents: Array<{ id: string; fullName: string; className: string | null; points: number; quizzes: number }>;
  teachers: Array<{ id: string; fullName: string; className: string | null; studentCount: number }>;
}

const emptyTeacherForm = { fullName: "", username: "", password: "", email: "", className: "", maxStudentAccounts: "30" };

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

  const { data: teachers, isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/school-admin/teachers"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<SchoolStats>({
    queryKey: ["/api/school/stats"],
  });

  const { data: students, isLoading: studentsLoading } = useQuery<StudentWithTeacher[]>({
    queryKey: ["/api/school-admin/students"],
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: typeof newTeacher) => {
      const res = await apiRequest("POST", "/api/school-admin/create-teacher", {
        ...data,
        maxStudentAccounts: Number(data.maxStudentAccounts) || 30,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school/stats"] });
      setGeneratedCredentials({ username: newTeacher.username, password: newTeacher.password });
      setNewTeacher(emptyTeacherForm);
      toast({ title: "Učitelj kreiran uspješno" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
      const res = await apiRequest("PUT", `/api/school-admin/update-teacher/${id}`, {
        ...data,
        maxStudentAccounts: Number(data.maxStudentAccounts) || 0,
      });
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
    mutationFn: async (teacherId: string) => {
      await apiRequest("DELETE", `/api/school-admin/delete-teacher/${teacherId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/students"] });
      toast({ title: "Učitelj i njegovi učenici su obrisani" });
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function generateUsername(fullName: string): string {
    const clean = fullName
      .toLowerCase()
      .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
      .replace(/ž/g, "z").replace(/đ/g, "dj")
      .replace(/[^a-z0-9]/g, "");
    return clean + Math.floor(Math.random() * 100);
  }

  function generatePassword(): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    const all = upper + lower + digits;
    let pwd = upper[Math.floor(Math.random() * upper.length)] +
              digits[Math.floor(Math.random() * digits.length)];
    for (let i = 0; i < 8; i++) pwd += all[Math.floor(Math.random() * all.length)];
    return pwd.split("").sort(() => Math.random() - 0.5).join("");
  }

  function autoFillCredentials() {
    const username = generateUsername(newTeacher.fullName);
    const password = generatePassword();
    setNewTeacher(prev => ({ ...prev, username, password }));
  }

  function openEditDialog(teacher: Teacher) {
    setEditTeacher(teacher);
    setEditForm({
      fullName: teacher.fullName,
      className: teacher.className || "",
      maxStudentAccounts: String(teacher.maxStudentAccounts || 30),
    });
  }

  const maxTeachers = user?.maxTeacherAccounts || 10;
  const currentTeacherCount = teachers?.length || 0;
  const totalLicencesUsed = teachers?.reduce((sum, t) => sum + (t.maxStudentAccounts || 0), 0) || 0;
  const totalLicencesAvail = user?.maxStudentAccounts || 200;

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.className || "").toLowerCase().includes(q) ||
      s.teacherName.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const classSummary = useMemo(() => {
    if (!students) return [];
    const map = new Map<string, { count: number; points: number }>();
    for (const s of students) {
      const key = s.className || "—";
      const cur = map.get(key) || { count: 0, points: 0 };
      map.set(key, { count: cur.count + 1, points: cur.points + s.points });
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.points - a.points);
  }, [students]);

  return (
    <DashboardLayout role="school_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-school-admin-title">
            {stats?.schoolName || user?.schoolName || "Škola"} — Upravljanje
          </h1>
          <p className="text-muted-foreground">Upravljajte učiteljima i pratite napredak škole</p>
        </div>

        {/* Stat cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-teachers">{stats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Učitelja</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <GraduationCap className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-students">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Učenika</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <BookOpen className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
                  <p className="text-sm text-muted-foreground">Kvizova</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgPoints}</p>
                  <p className="text-sm text-muted-foreground">Prosjek bodova</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Licence summary */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted border text-sm">
          <span className="font-medium">Licence za učenike:</span>
          <span>
            <strong className={totalLicencesUsed > totalLicencesAvail ? "text-destructive" : "text-green-600"}>
              {totalLicencesUsed}
            </strong>
            {" / "}
            {totalLicencesAvail} dodijeljenih učiteljima
          </span>
          <span className="text-muted-foreground">•</span>
          <span>
            Učitelji: <strong>{currentTeacherCount}</strong> / {maxTeachers}
          </span>
        </div>

        <Tabs defaultValue="teachers">
          <TabsList>
            <TabsTrigger value="teachers" data-testid="tab-teachers">
              Učitelji ({currentTeacherCount})
            </TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">
              Učenici ({students?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="classes" data-testid="tab-classes">
              Razredi ({classSummary.length})
            </TabsTrigger>
          </TabsList>

          {/* UČITELJI */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lista učitelja
                </CardTitle>
                <Button
                  onClick={() => { setNewTeacher(emptyTeacherForm); setGeneratedCredentials(null); setShowAddDialog(true); }}
                  disabled={currentTeacherCount >= maxTeachers}
                  size="sm"
                  data-testid="button-add-teacher"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Dodaj učitelja
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {teachersLoading ? (
                  <div className="p-6 space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : teachers && teachers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ime i prezime</TableHead>
                        <TableHead>Korisničko ime</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Razred(i)</TableHead>
                        <TableHead>Licence (učenici)</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map(teacher => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium" data-testid={`text-teacher-name-${teacher.id}`}>
                            {teacher.fullName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{teacher.username}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{teacher.email || "—"}</TableCell>
                          <TableCell>{teacher.className || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{teacher.maxStudentAccounts}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(teacher)}
                                data-testid={`button-edit-teacher-${teacher.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirm(teacher)}
                                data-testid={`button-delete-teacher-${teacher.id}`}
                              >
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

          {/* UČENICI */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Svi učenici škole
                  </CardTitle>
                  <div className="relative w-64">
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
              </CardHeader>
              <CardContent className="p-0">
                {studentsLoading ? (
                  <div className="p-6 space-y-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ime i prezime</TableHead>
                        <TableHead>Korisničko ime</TableHead>
                        <TableHead>Razred</TableHead>
                        <TableHead>Starosna grupa</TableHead>
                        <TableHead>Bodovi</TableHead>
                        <TableHead>Učitelj</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.fullName}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{student.username}</TableCell>
                          <TableCell>{student.className || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.ageGroup || "—"}</Badge>
                          </TableCell>
                          <TableCell className="font-bold text-orange-600">{student.points}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{student.teacherName}</TableCell>
                        </TableRow>
                      ))}
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

          {/* RAZREDI */}
          <TabsContent value="classes">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Pregled po razredima
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {studentsLoading ? (
                  <div className="p-6 space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : classSummary.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Razred</TableHead>
                        <TableHead>Broj učenika</TableHead>
                        <TableHead>Ukupno bodova</TableHead>
                        <TableHead>Prosjek bodova</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classSummary.map(cls => (
                        <TableRow key={cls.name}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>{cls.count}</TableCell>
                          <TableCell className="font-bold text-orange-600">{cls.points}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {cls.count > 0 ? Math.round(cls.points / cls.count) : 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Nema razreda — učenici još nisu dodani</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dodaj učitelja dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setGeneratedCredentials(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novog učitelja</DialogTitle>
              <DialogDescription>
                Kreirajte račun za nastavnika vaše škole. Nastavnik će moći kreirati učeničke račune.
              </DialogDescription>
            </DialogHeader>

            {generatedCredentials ? (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-800 dark:text-green-200 mb-3">Učitelj je uspješno kreiran!</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Korisničko ime:</span>
                      <div className="flex items-center gap-1 font-mono font-bold">
                        {generatedCredentials.username}
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(generatedCredentials.username); toast({ title: "Kopirano!" }); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Lozinka:</span>
                      <div className="flex items-center gap-1 font-mono font-bold">
                        {generatedCredentials.password}
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(generatedCredentials.password); toast({ title: "Kopirano!" }); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
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
                  <Input
                    value={newTeacher.fullName}
                    onChange={e => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Npr. Amina Hodžić"
                    data-testid="input-new-teacher-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Razred(i)</label>
                    <Input
                      value={newTeacher.className}
                      onChange={e => setNewTeacher(prev => ({ ...prev, className: e.target.value }))}
                      placeholder="Npr. 4a, 4b"
                      data-testid="input-new-teacher-class"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Broj licenci za učenike</label>
                    <Input
                      type="number"
                      min={1}
                      max={totalLicencesAvail}
                      value={newTeacher.maxStudentAccounts}
                      onChange={e => setNewTeacher(prev => ({ ...prev, maxStudentAccounts: e.target.value }))}
                      data-testid="input-new-teacher-licenses"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maks. učenika koje ovaj učitelj može kreirati</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newTeacher.email}
                    onChange={e => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@skola.ba"
                    data-testid="input-new-teacher-email"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Korisničko ime *</label>
                    <Input
                      value={newTeacher.username}
                      onChange={e => setNewTeacher(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="korisnicko.ime"
                      data-testid="input-new-teacher-username"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoFillCredentials}
                    disabled={!newTeacher.fullName}
                    title="Auto-generiši korisničko ime i lozinku"
                    data-testid="button-auto-generate"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Auto
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Lozinka *</label>
                  <Input
                    value={newTeacher.password}
                    onChange={e => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Min. 8 znakova, 1 veliko slovo, 1 broj"
                    data-testid="input-new-teacher-password"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Otkaži</Button>
                  <Button
                    onClick={() => createTeacherMutation.mutate(newTeacher)}
                    disabled={createTeacherMutation.isPending || !newTeacher.fullName || !newTeacher.username || !newTeacher.password}
                    data-testid="button-confirm-create-teacher"
                  >
                    {createTeacherMutation.isPending ? "Kreiranje..." : "Kreiraj učitelja"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Uredi učitelja dialog */}
        <Dialog open={!!editTeacher} onOpenChange={(open) => !open && setEditTeacher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uredi učitelja</DialogTitle>
              <DialogDescription>Izmijeni podatke za {editTeacher?.fullName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Ime i prezime</label>
                <Input
                  value={editForm.fullName}
                  onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                  data-testid="input-edit-teacher-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Razred(i)</label>
                <Input
                  value={editForm.className}
                  onChange={e => setEditForm(p => ({ ...p, className: e.target.value }))}
                  placeholder="Npr. 5a, 5b"
                  data-testid="input-edit-teacher-class"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Broj licenci za učenike</label>
                <Input
                  type="number"
                  min={0}
                  max={totalLicencesAvail}
                  value={editForm.maxStudentAccounts}
                  onChange={e => setEditForm(p => ({ ...p, maxStudentAccounts: e.target.value }))}
                  data-testid="input-edit-teacher-licenses"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maksimalan dozvoljeni broj: {totalLicencesAvail}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTeacher(null)}>Otkaži</Button>
              <Button
                onClick={() => editTeacher && updateTeacherMutation.mutate({ id: editTeacher.id, data: editForm })}
                disabled={updateTeacherMutation.isPending || !editForm.fullName}
                data-testid="button-confirm-edit-teacher"
              >
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
              <AlertDialogAction
                onClick={() => deleteConfirm && deleteTeacherMutation.mutate(deleteConfirm.id)}
                disabled={deleteTeacherMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete-teacher"
              >
                {deleteTeacherMutation.isPending ? "Brisanje..." : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
