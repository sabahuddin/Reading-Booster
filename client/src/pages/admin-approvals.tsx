import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CheckCircle2, XCircle, UserCheck, Clock, Users, GraduationCap, BookOpen, Brain, BookPlus,
} from "lucide-react";
import type { Quiz } from "@shared/schema";

interface PendingUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  institutionType: string | null;
  institutionRole: string | null;
  schoolName: string | null;
  className: string | null;
  approved: boolean;
}

type PendingQuizEdit = Quiz & { bookTitle?: string; teacherName?: string };

type PendingQuizCreation = Quiz & {
  bookTitle?: string;
  bookAuthor?: string;
  bookAgeGroup?: string;
  teacherName?: string;
  questionCount?: number;
};

const roleLabels: Record<string, string> = {
  ucitelj: "Nastavnik",
  bibliotekar: "Bibliotekar",
  sekretar: "Sekretar",
  administrator: "Školski administrator",
};

const typeLabels: Record<string, string> = {
  school: "Škola",
  osnovna_skola: "Osnovna škola",
  srednja_skola: "Srednja škola",
  library: "Biblioteka",
};

export default function AdminApprovals() {
  const { toast } = useToast();
  const [approveDialog, setApproveDialog] = useState<PendingUser | null>(null);
  const [maxStudents, setMaxStudents] = useState("30");
  const [maxTeachers, setMaxTeachers] = useState("10");

  const isSchoolAdmin = approveDialog?.role === "school_admin";

  const { data: pendingList, isLoading } = useQuery<PendingUser[]>({
    queryKey: ["/api/admin/pending-teachers"],
  });

  const { data: pendingQuizEdits, isLoading: quizEditsLoading } = useQuery<PendingQuizEdit[]>({
    queryKey: ["/api/admin/pending-quiz-edits"],
  });

  const { data: pendingQuizCreations, isLoading: quizCreationsLoading } = useQuery<PendingQuizCreation[]>({
    queryKey: ["/api/admin/pending-quiz-creations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pending-quiz-creations", { credentials: "include" });
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, maxStudentAccounts, maxTeacherAccounts }: { id: string; maxStudentAccounts: number; maxTeacherAccounts?: number }) => {
      const res = await apiRequest("PUT", `/api/admin/approve-teacher/${id}`, { maxStudentAccounts, maxTeacherAccounts });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Račun odobren" });
      setApproveDialog(null);
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-teachers"] });
      toast({ title: "Zahtjev odbijen" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const approveQuizEditMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const res = await apiRequest("POST", `/api/admin/quiz-edits/${quizId}/approve`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-quiz-edits"] });
      toast({ title: "Kviz odobren", description: data.message });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const rejectQuizEditMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const res = await apiRequest("POST", `/api/admin/quiz-edits/${quizId}/reject`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-quiz-edits"] });
      toast({ title: "Izmjene odbijene", description: data.message });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const approveQuizCreationMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const res = await apiRequest("POST", `/api/admin/quiz-creations/${quizId}/approve`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-quiz-creations"] });
      toast({ title: "Kviz odobren", description: data.message });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const rejectQuizCreationMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const res = await apiRequest("POST", `/api/admin/quiz-creations/${quizId}/reject`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-quiz-creations"] });
      toast({ title: "Kviz odbijen", description: data.message });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function openApproveDialog(user: PendingUser) {
    setApproveDialog(user);
    if (user.role === "school_admin") { setMaxTeachers("10"); setMaxStudents("200"); }
    else { setMaxStudents("30"); }
  }

  const pendingUsersCount = pendingList?.length ?? 0;
  const pendingQuizEditsCount = pendingQuizEdits?.length ?? 0;
  const pendingQuizCreationsCount = pendingQuizCreations?.length ?? 0;
  const totalBadge = pendingQuizEditsCount + pendingQuizCreationsCount;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-approvals-title">Zahtjevi za odobrenje</h1>
          <p className="text-muted-foreground">Odobrite ili odbijte zahtjeve institucija, izmjene kvizova i nove kvizove nastavnika</p>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-user-approvals">
              Korisnici
              {pendingUsersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-amber-500 text-white">
                  {pendingUsersCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quiz-edits" data-testid="tab-quiz-approvals">
              Izmjene kvizova
              {pendingQuizEditsCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-amber-500 text-white">
                  {pendingQuizEditsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quiz-creations" data-testid="tab-quiz-creations-approvals">
              Novi kvizovi
              {pendingQuizCreationsCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-amber-500 text-white">
                  {pendingQuizCreationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ===== KORISNICI ===== */}
          <TabsContent value="users" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32" />)}</div>
            ) : pendingList && pendingList.length > 0 ? (
              <div className="space-y-4">
                {pendingList.map(user => (
                  <Card key={user.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-5 w-5 text-amber-500" />
                          <CardTitle className="text-base" data-testid={`text-pending-name-${user.id}`}>{user.fullName}</CardTitle>
                          <Badge variant="outline">Na čekanju</Badge>
                          {user.role === "school_admin" && (
                            <Badge className="bg-blue-100 text-blue-800">Školski admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openApproveDialog(user)} data-testid={`button-approve-${user.id}`}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />Odobri
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(user.id)} data-testid={`button-reject-${user.id}`}>
                          <XCircle className="mr-1 h-4 w-4" />Odbij
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tip institucije:</span>
                          <p className="font-medium">{user.institutionType ? typeLabels[user.institutionType] || user.institutionType : "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uloga:</span>
                          <p className="font-medium">{user.role === "school_admin" ? "Školski administrator" : (user.institutionRole ? roleLabels[user.institutionRole] || user.institutionRole : "-")}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Institucija:</span>
                          <p className="font-medium">{user.schoolName || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Korisničko ime:</span>
                          <p className="font-medium">{user.username}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nema zahtjeva na čekanju</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== KVIZ IZMJENE ===== */}
          <TabsContent value="quiz-edits" className="mt-4">
            {quizEditsLoading ? (
              <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-28" />)}</div>
            ) : pendingQuizEdits && pendingQuizEdits.length > 0 ? (
              <div className="space-y-4">
                {pendingQuizEdits.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-5 w-5 text-amber-500" />
                          <CardTitle className="text-base" data-testid={`text-quiz-edit-title-${quiz.id}`}>
                            {quiz.bookTitle || "Nepoznata knjiga"}
                          </CardTitle>
                          <Badge className="bg-amber-100 text-amber-800">Na čekanju</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Izmjena postojećeg kviza
                        </p>
                        {quiz.teacherName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Nastavnik/ica: <span className="font-medium">{quiz.teacherName}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveQuizEditMutation.mutate(quiz.id)} disabled={approveQuizEditMutation.isPending} data-testid={`button-approve-quiz-${quiz.id}`}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />Odobri
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectQuizEditMutation.mutate(quiz.id)} disabled={rejectQuizEditMutation.isPending} data-testid={`button-reject-quiz-${quiz.id}`}>
                          <XCircle className="mr-1 h-4 w-4" />Odbij
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status kviza:</span>
                          <p className="font-medium">{quiz.teacherEditStatus}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nakon odobravanja:</span>
                          <p className="font-medium text-green-700">Prikazuje "Kviz odobrio: {quiz.teacherName}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nema kviz izmjena na čekanju</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== NOVI KVIZOVI (kreacija od nastavnika) ===== */}
          <TabsContent value="quiz-creations" className="mt-4">
            {quizCreationsLoading ? (
              <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-28" />)}</div>
            ) : pendingQuizCreations && pendingQuizCreations.length > 0 ? (
              <div className="space-y-4">
                {pendingQuizCreations.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <BookPlus className="h-5 w-5 text-amber-500" />
                          <CardTitle className="text-base" data-testid={`text-quiz-creation-title-${quiz.id}`}>
                            {quiz.bookTitle || "Nepoznata knjiga"}
                          </CardTitle>
                          <Badge className="bg-amber-100 text-amber-800">Novi kviz</Badge>
                          {(quiz as any).bookPendingApproval && (
                            <Badge className="bg-purple-100 text-purple-800">+ Nova knjiga</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Kviz: <span className="font-medium">{quiz.title}</span>
                        </p>
                        {(quiz as any).bookAuthor && (
                          <p className="text-sm text-muted-foreground">
                            Knjiga: <span className="font-medium">{(quiz as any).bookAuthor}</span>
                            {(quiz as any).bookAgeGroup && <span> · {(quiz as any).bookAgeGroup}</span>}
                          </p>
                        )}
                        {quiz.teacherName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Nastavnik/ica: <span className="font-medium">{quiz.teacherName}</span>
                          </p>
                        )}
                        {(quiz as any).questionCount !== undefined && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Broj pitanja: <span className="font-medium">{(quiz as any).questionCount}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Button size="sm" onClick={() => approveQuizCreationMutation.mutate(quiz.id)} disabled={approveQuizCreationMutation.isPending} data-testid={`button-approve-creation-${quiz.id}`}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />Odobri
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectQuizCreationMutation.mutate(quiz.id)} disabled={rejectQuizCreationMutation.isPending} data-testid={`button-reject-creation-${quiz.id}`}>
                          <XCircle className="mr-1 h-4 w-4" />Odbij
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Odobravanje uključuje:</span>
                          <p className="font-medium text-green-700">
                            Kviz postaje vidljiv učenicima
                            {(quiz as any).bookPendingApproval ? " + knjiga se objavljuje" : ""}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Odbijanje znači:</span>
                          <p className="font-medium text-red-600">
                            Kviz i pitanja se brišu
                            {(quiz as any).bookPendingApproval ? " + knjiga se briše" : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nema novih kvizova na čekanju</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog za odobrenje korisnika */}
        <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Odobri registraciju</DialogTitle>
              <DialogDescription>
                Odobravate račun za <strong>{approveDialog?.fullName}</strong> iz institucije{" "}
                <strong>{approveDialog?.schoolName}</strong>.
                {isSchoolAdmin
                  ? " Odredite maksimalan broj nastavničkih i učeničkih računa za ovu školu."
                  : " Odredite maksimalan broj učeničkih računa."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {isSchoolAdmin && (
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Maksimalan broj nastavničkih računa
                  </label>
                  <Input type="number" value={maxTeachers} onChange={e => setMaxTeachers(e.target.value)} min="1" max="100" className="mt-1" data-testid="input-max-teachers" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Maksimalan broj učeničkih računa
                </label>
                <Input type="number" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} min="1" max="500" className="mt-1" data-testid="input-max-students" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog(null)}>Otkaži</Button>
              <Button
                onClick={() => {
                  if (approveDialog) {
                    approveMutation.mutate({
                      id: approveDialog.id,
                      maxStudentAccounts: parseInt(maxStudents) || (isSchoolAdmin ? 200 : 30),
                      maxTeacherAccounts: isSchoolAdmin ? (parseInt(maxTeachers) || 10) : undefined,
                    });
                  }
                }}
                disabled={approveMutation.isPending}
                data-testid="button-confirm-approve"
              >
                {approveMutation.isPending ? "Odobravanje..." : "Potvrdi odobrenje"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
