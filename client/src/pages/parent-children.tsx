import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Baby, Star, Trophy, Users, GraduationCap, Pencil, KeyRound, Trash2 } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ChildUser = Omit<User, "password">;

function EditChildDialog({ child, open, onClose }: { child: ChildUser; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/parent/children/${child.id}/password`, { newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lozinka promijenjena", description: "Nova lozinka je sačuvana." });
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteChildMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/parent/children/${child.id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profil obrisan", description: `Profil za ${child.fullName} je uspješno obrisan.` });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/children"] });
      setDeleteOpen(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      toast({ title: "Greška", description: "Lozinka mora imati najmanje 6 karaktera.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Greška", description: "Lozinke se ne podudaraju.", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setNewPassword(""); setConfirmPassword(""); onClose(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Uredi profil — {child.fullName}</DialogTitle>
            <DialogDescription>
              Korisničko ime <strong>{child.username}</strong> se ne može mijenjati.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="h-4 w-4" />
                Promijeni lozinku
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-child-password">Nova lozinka</Label>
                <Input
                  id="new-child-password"
                  type="password"
                  placeholder="Min. 6 karaktera"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-child-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-child-password">Potvrdi lozinku</Label>
                <Input
                  id="confirm-child-password"
                  type="password"
                  placeholder="Ponovi lozinku"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-child-confirm-password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending || !newPassword}
                className="w-full"
                data-testid="button-save-child-password"
              >
                {changePasswordMutation.isPending ? "Čuvam..." : "Sačuvaj lozinku"}
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-3">
                <Trash2 className="h-4 w-4" />
                Brisanje profila
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Brisanjem profila trajno se brišu svi podaci, bodovi i rezultati kvizova za {child.fullName}.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                className="w-full"
                data-testid="button-delete-child"
              >
                Obriši profil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ovo će trajno obrisati profil za <strong>{child.fullName}</strong> ({child.username}).
              Svi bodovi i rezultati kvizova bit će izgubljeni. Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-child">Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteChildMutation.mutate()}
              disabled={deleteChildMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-child"
            >
              {deleteChildMutation.isPending ? "Brišem..." : "Da, obriši profil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ChildDetailTab({ child }: { child: ChildUser }) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", child.id],
  });
  const [editOpen, setEditOpen] = useState(false);

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(
        results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes
      )
    : 0;

  const isParentCreated = !child.createdByTeacherId;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg" data-testid={`text-child-detail-name-${child.id}`}>
              {child.fullName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default">
                <Star className="mr-1" />
                {child.points} bodova
              </Badge>
              {isParentCreated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditOpen(true)}
                  data-testid={`button-edit-child-${child.id}`}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Uredi
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {child.schoolName && (
              <Badge variant="secondary">
                <GraduationCap className="mr-1" />
                {child.schoolName}
              </Badge>
            )}
            {child.className && (
              <Badge variant="outline">{child.className}</Badge>
            )}
            <Badge variant="outline">{child.username}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-detail-quizzes-${child.id}`}>{totalQuizzes}</p>
              <p className="text-xs text-muted-foreground">Kvizova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-detail-score-${child.id}`}>{totalScore}</p>
              <p className="text-xs text-muted-foreground">Bodova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-detail-accuracy-${child.id}`}>{avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Tačnost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rezultati kvizova</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !results || results.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Dijete još nema rezultata kvizova.</p>
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
        </CardContent>
      </Card>

      {isParentCreated && (
        <EditChildDialog child={child} open={editOpen} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}

export default function ParentChildren() {
  const { data: children, isLoading } = useQuery<ChildUser[]>({
    queryKey: ["/api/parent/children"],
  });

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-children-title">Djeca</h1>
          <p className="text-muted-foreground">Detaljni pregled napretka vaše djece.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !children || children.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Nema povezane djece</p>
              <p className="text-muted-foreground">
                Djeca još nisu povezana s vašim računom. Obratite se administratoru.
              </p>
            </CardContent>
          </Card>
        ) : children.length === 1 ? (
          <ChildDetailTab child={children[0]} />
        ) : (
          <Tabs defaultValue={children[0].id} className="space-y-4">
            <TabsList className="flex-wrap">
              {children.map((child) => (
                <TabsTrigger
                  key={child.id}
                  value={child.id}
                  data-testid={`tab-child-${child.id}`}
                >
                  <Baby className="mr-1" />
                  {child.fullName}
                </TabsTrigger>
              ))}
            </TabsList>
            {children.map((child) => (
              <TabsContent key={child.id} value={child.id}>
                <ChildDetailTab child={child} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
