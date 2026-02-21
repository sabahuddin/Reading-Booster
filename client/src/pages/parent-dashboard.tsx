import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Baby, Star, Trophy, Users, BookOpen, UserPlus, Clock, CheckCircle2, Copy, Sparkles } from "lucide-react";
import type { User, QuizResult } from "@shared/schema";

type ChildUser = Omit<User, "password">;

const ageGroupLabels: Record<string, string> = {
  R1: "Od 1. razreda (6-9 god.)",
  R4: "Od 4. razreda (10-12 god.)",
  R7: "Od 7. razreda (13-15 god.)",
  O: "Omladina (15-18 god.)",
  A: "Odrasli (18+)",
};

function ChildSummaryCard({ child }: { child: ChildUser }) {
  const { data: results, isLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz-results/user", child.id],
  });

  const totalQuizzes = results?.length ?? 0;
  const totalScore = results?.reduce((sum, r) => sum + r.score, 0) ?? 0;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(results!.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / totalQuizzes)
    : 0;

  const recentResults = results?.slice(0, 3) ?? [];
  const isReader = child.role === "reader";

  return (
    <Card data-testid={`card-child-${child.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {isReader ? <Sparkles className="text-muted-foreground" /> : <Baby className="text-muted-foreground" />}
            <CardTitle className="text-lg" data-testid={`text-child-name-${child.id}`}>
              {child.fullName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isReader ? "secondary" : "default"}>
              {isReader ? "Čitalac Pro" : "Dijete"}
            </Badge>
            <Badge variant="default">
              <Star className="mr-1 h-3 w-3" />
              {child.points} bodova
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {child.ageGroup && (
            <Badge variant="outline">{ageGroupLabels[child.ageGroup as string] || child.ageGroup}</Badge>
          )}
          <Badge variant="outline" className="text-xs">@{child.username}</Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-child-quizzes-${child.id}`}>{totalQuizzes}</p>
              <p className="text-xs text-muted-foreground">Kvizova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-child-score-${child.id}`}>{totalScore}</p>
              <p className="text-xs text-muted-foreground">Bodova</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted">
              <p className="text-xl font-bold" data-testid={`text-child-accuracy-${child.id}`}>{avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Tačnost</p>
            </div>
          </div>
        )}

        {recentResults.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 text-muted-foreground">Nedavni kvizovi:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kviz</TableHead>
                  <TableHead>Tačno</TableHead>
                  <TableHead>Bodovi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResults.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.quizId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.correctAnswers}/{r.totalQuestions}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{r.score}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LinkRequest {
  id: string;
  parentId: string;
  studentId: string;
  teacherId: string;
  status: string;
  studentName: string;
  studentUsername: string;
  createdAt: string;
}

interface CreatedAccount {
  username: string;
  fullName: string;
  generatedPassword: string;
  role: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentUsername, setStudentUsername] = useState("");
  const [childName, setChildName] = useState("");
  const [childAgeGroup, setChildAgeGroup] = useState("R1");
  const [readerName, setReaderName] = useState("");
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  const { data: familyMembers, isLoading } = useQuery<ChildUser[]>({
    queryKey: ["/api/parent/family-members"],
  });

  const { data: children } = useQuery<ChildUser[]>({
    queryKey: ["/api/parent/children"],
  });

  const { data: linkRequests } = useQuery<LinkRequest[]>({
    queryKey: ["/api/parent/link-requests"],
  });

  const allChildren = [...(familyMembers || []), ...(children || [])];
  const uniqueChildren = allChildren.filter((child, index, self) =>
    index === self.findIndex(c => c.id === child.id)
  );
  const studentMembers = uniqueChildren.filter(c => c.role === "student");
  const readerMembers = uniqueChildren.filter(c => c.role === "reader");

  const linkChildMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/parent/link-child", { studentUsername: username });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent/link-requests"] });
      toast({ title: "Zahtjev poslan", description: "Učitelj će odobriti vaš zahtjev za povezivanje." });
      setStudentUsername("");
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: { fullName: string; ageGroup: string }) => {
      const res = await apiRequest("POST", "/api/parent/create-child", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent/family-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/children"] });
      setCreatedAccount({
        username: data.username,
        fullName: data.fullName,
        generatedPassword: data.generatedPassword,
        role: "student",
      });
      setChildName("");
      setChildAgeGroup("R1");
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const createReaderMutation = useMutation({
    mutationFn: async (data: { fullName: string }) => {
      const res = await apiRequest("POST", "/api/parent/create-reader", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent/family-members"] });
      setCreatedAccount({
        username: data.username,
        fullName: data.fullName,
        generatedPassword: data.generatedPassword,
        role: "reader",
      });
      setReaderName("");
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const totalChildPoints = studentMembers.reduce((sum, c) => sum + c.points, 0);
  const pendingRequests = linkRequests?.filter(r => r.status === "pending") || [];

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopirano!", description: "Podatci su kopirani." });
  }

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-welcome">
            Dobrodošli, {user?.fullName || "Roditelju"}!
          </h1>
          <p className="text-muted-foreground">
            Upravljajte porodičnim profilima i pratite napredak djece.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Djece</CardTitle>
              <Baby className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-children">{studentMembers.length}</div>
              <p className="text-xs text-muted-foreground">maks. 3</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Čitalac Pro</CardTitle>
              <Sparkles className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{readerMembers.length}</div>
              <p className="text-xs text-muted-foreground">maks. 1</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bodovi djece</CardTitle>
              <Star className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-points">{totalChildPoints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vaši bodovi</CardTitle>
              <Trophy className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-parent-points">{user?.points ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Kreiraj dječiji profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Kreirajte račun za vaše dijete. Korisničko ime i lozinka će biti automatski generirani.
              </p>
              <div className="space-y-3">
                <div>
                  <Label>Ime i prezime djeteta</Label>
                  <Input
                    placeholder="npr. Amina Hodžić"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    data-testid="input-child-name"
                  />
                </div>
                <div>
                  <Label>Starosna skupina</Label>
                  <Select value={childAgeGroup} onValueChange={setChildAgeGroup}>
                    <SelectTrigger data-testid="select-child-age">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R1">Od 1. razreda (6-9 god.)</SelectItem>
                      <SelectItem value="R4">Od 4. razreda (10-12 god.)</SelectItem>
                      <SelectItem value="R7">Od 7. razreda (13-15 god.)</SelectItem>
                      <SelectItem value="O">Omladina (15-18 god.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createChildMutation.mutate({ fullName: childName, ageGroup: childAgeGroup })}
                  disabled={createChildMutation.isPending || !childName.trim() || studentMembers.length >= 3}
                  className="w-full"
                  data-testid="button-create-child"
                >
                  {createChildMutation.isPending ? "Kreira se..." : `Kreiraj profil (${studentMembers.length}/3)`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Kreiraj Čitalac Pro profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Kreirajte Čitalac Pro račun za člana porodice. Može rješavati kvizove i pratiti rezultate djece.
              </p>
              <div className="space-y-3">
                <div>
                  <Label>Ime i prezime</Label>
                  <Input
                    placeholder="npr. Emir Hodžić"
                    value={readerName}
                    onChange={e => setReaderName(e.target.value)}
                    data-testid="input-reader-name"
                  />
                </div>
                <Button
                  onClick={() => createReaderMutation.mutate({ fullName: readerName })}
                  disabled={createReaderMutation.isPending || !readerName.trim() || readerMembers.length >= 1}
                  className="w-full"
                  data-testid="button-create-reader"
                >
                  {createReaderMutation.isPending ? "Kreira se..." : `Kreiraj Čitalac Pro (${readerMembers.length}/1)`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={!!createdAccount} onOpenChange={() => setCreatedAccount(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {createdAccount?.role === "reader" ? "Čitalac Pro račun kreiran!" : "Dječiji račun kreiran!"}
              </DialogTitle>
            </DialogHeader>
            {createdAccount && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sačuvajte ove podatke - lozinka se ne može ponovo prikazati.
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Ime</p>
                      <p className="font-medium">{createdAccount.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Korisničko ime</p>
                      <p className="font-mono font-medium">{createdAccount.username}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdAccount.username)} data-testid="button-copy-username">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Lozinka</p>
                      <p className="font-mono font-medium text-lg">{createdAccount.generatedPassword}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdAccount.generatedPassword)} data-testid="button-copy-password">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={() => setCreatedAccount(null)} className="w-full" data-testid="button-close-created">
                  Razumijem, sačuvao/la sam podatke
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((j) => <Skeleton key={j} className="h-16 w-full" />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : uniqueChildren.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto mb-4 text-muted-foreground h-12 w-12" />
              <p className="text-lg font-medium">Nema članova porodice</p>
              <p className="text-muted-foreground mb-4">
                Kreirajte dječije profile ili Čitalac Pro profil iznad.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Članovi porodice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueChildren.map((child) => (
                <ChildSummaryCard key={child.id} child={child} />
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Poveži postojeće dijete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ako vaše dijete već ima školski račun, unesite korisničko ime. Učitelj će odobriti povezivanje.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Korisničko ime učenika"
                value={studentUsername}
                onChange={e => setStudentUsername(e.target.value)}
                data-testid="input-link-child-username"
              />
              <Button
                onClick={() => linkChildMutation.mutate(studentUsername)}
                disabled={linkChildMutation.isPending || !studentUsername.trim()}
                data-testid="button-link-child"
              >
                {linkChildMutation.isPending ? "Šalje se..." : "Pošalji zahtjev"}
              </Button>
            </div>

            {pendingRequests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Zahtjevi na čekanju:</p>
                <div className="space-y-2">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{req.studentName} ({req.studentUsername})</span>
                      <Badge variant="outline" className="ml-auto">Na čekanju</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {linkRequests && linkRequests.filter(r => r.status === "approved").length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Odobreni zahtjevi:</p>
                <div className="space-y-2">
                  {linkRequests.filter(r => r.status === "approved").map(req => (
                    <div key={req.id} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{req.studentName} ({req.studentUsername})</span>
                      <Badge variant="outline" className="ml-auto text-green-600">Odobreno</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
