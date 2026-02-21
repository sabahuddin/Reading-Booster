import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Users, UserPlus, Trash2, School, GraduationCap, BookOpen, BarChart3, Copy } from "lucide-react";

interface Teacher {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  className: string | null;
  maxStudentAccounts: number;
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

export default function SchoolAdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({ fullName: "", username: "", password: "", email: "", className: "" });
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null);

  const { data: teachers, isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/school-admin/teachers"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<SchoolStats>({
    queryKey: ["/api/school/stats"],
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: typeof newTeacher) => {
      const res = await apiRequest("POST", "/api/school-admin/create-teacher", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/school/stats"] });
      setGeneratedCredentials({ username: newTeacher.username, password: newTeacher.password });
      setNewTeacher({ fullName: "", username: "", password: "", email: "", className: "" });
      toast({ title: "Učitelj kreiran uspješno" });
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
      toast({ title: "Učitelj obrisan" });
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function generateUsername(fullName: string): string {
    const clean = fullName
      .toLowerCase()
      .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "dj")
      .replace(/[^a-z0-9]/g, "");
    return clean + Math.floor(Math.random() * 100);
  }

  function generatePassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  }

  function autoFillCredentials() {
    const username = generateUsername(newTeacher.fullName);
    const password = generatePassword();
    setNewTeacher(prev => ({ ...prev, username, password }));
  }

  const maxTeachers = user?.maxTeacherAccounts || 10;
  const currentTeacherCount = teachers?.length || 0;

  return (
    <DashboardLayout role="school_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-school-admin-title">
            {stats?.schoolName || "Škola"} - Upravljanje
          </h1>
          <p className="text-muted-foreground">Upravljajte učiteljima i pratite napredak škole</p>
        </div>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Učitelji ({currentTeacherCount}/{maxTeachers})
            </CardTitle>
            <Button
              onClick={() => setShowAddDialog(true)}
              disabled={currentTeacherCount >= maxTeachers}
              data-testid="button-add-teacher"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Dodaj učitelja
            </Button>
          </CardHeader>
          <CardContent>
            {teachersLoading ? (
              <Skeleton className="h-48" />
            ) : teachers && teachers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Razred</TableHead>
                    <TableHead>Max učenika</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map(teacher => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium" data-testid={`text-teacher-name-${teacher.id}`}>{teacher.fullName}</TableCell>
                      <TableCell>{teacher.username}</TableCell>
                      <TableCell>{teacher.email || "-"}</TableCell>
                      <TableCell>{teacher.className || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacher.maxStudentAccounts}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(teacher)}
                          data-testid={`button-delete-teacher-${teacher.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Još niste dodali učitelje</p>
                <p className="text-sm">Kliknite "Dodaj učitelja" da kreirate prvi račun</p>
              </div>
            )}
          </CardContent>
        </Card>

        {stats && stats.topStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 učenika</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Razred</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Kvizovi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topStudents.map((student, i) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.className || "-"}</TableCell>
                      <TableCell className="font-bold text-orange-600">{student.points}</TableCell>
                      <TableCell>{student.quizzes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setGeneratedCredentials(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novog učitelja</DialogTitle>
              <DialogDescription>
                Kreirajte račun za učitelja vaše škole. Učitelj će moći kreirati učeničke račune.
              </DialogDescription>
            </DialogHeader>
            {generatedCredentials ? (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-800 dark:text-green-200 mb-2">Učitelj je uspješno kreiran!</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Korisničko ime: <strong>{generatedCredentials.username}</strong></span>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(generatedCredentials.username); toast({ title: "Kopirano!" }); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lozinka: <strong>{generatedCredentials.password}</strong></span>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(generatedCredentials.password); toast({ title: "Kopirano!" }); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs mt-3 text-muted-foreground">Zapišite ove podatke i proslijedite ih učitelju.</p>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setShowAddDialog(false); setGeneratedCredentials(null); }}>Zatvori</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Ime i prezime *</label>
                  <Input
                    value={newTeacher.fullName}
                    onChange={e => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Npr. Amina Hodžić"
                    data-testid="input-new-teacher-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Razred / Grupa</label>
                  <Input
                    value={newTeacher.className}
                    onChange={e => setNewTeacher(prev => ({ ...prev, className: e.target.value }))}
                    placeholder="Npr. 4a"
                    data-testid="input-new-teacher-class"
                  />
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
                    data-testid="button-auto-generate"
                  >
                    Auto
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Lozinka *</label>
                  <Input
                    value={newTeacher.password}
                    onChange={e => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimalno 8 znakova"
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

        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Obriši učitelja</DialogTitle>
              <DialogDescription>
                Da li ste sigurni da želite obrisati učitelja <strong>{deleteConfirm?.fullName}</strong>?
                Ovo će također obrisati sve učeničke račune kreirane od strane ovog učitelja i njihove rezultate kvizova.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Otkaži</Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && deleteTeacherMutation.mutate(deleteConfirm.id)}
                disabled={deleteTeacherMutation.isPending}
                data-testid="button-confirm-delete-teacher"
              >
                {deleteTeacherMutation.isPending ? "Brisanje..." : "Obriši"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
