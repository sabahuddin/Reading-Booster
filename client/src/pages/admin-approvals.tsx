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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, XCircle, School, UserCheck, Clock } from "lucide-react";

interface PendingTeacher {
  id: string;
  fullName: string;
  username: string;
  email: string;
  institutionType: string | null;
  institutionRole: string | null;
  schoolName: string | null;
  className: string | null;
  approved: boolean;
}

const roleLabels: Record<string, string> = {
  ucitelj: "Učitelj",
  muallim: "Učitelj",
  bibliotekar: "Učitelj",
  sekretar: "Sekretar",
};

const typeLabels: Record<string, string> = {
  school: "Škola",
  mekteb: "Škola",
};

export default function AdminApprovals() {
  const { toast } = useToast();
  const [approveDialog, setApproveDialog] = useState<PendingTeacher | null>(null);
  const [maxAccounts, setMaxAccounts] = useState("30");

  const { data: pendingList, isLoading } = useQuery<PendingTeacher[]>({
    queryKey: ["/api/admin/pending-teachers"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, maxStudentAccounts }: { id: string; maxStudentAccounts: number }) => {
      const res = await apiRequest("PUT", `/api/admin/approve-teacher/${id}`, { maxStudentAccounts });
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

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-approvals-title">Zahtjevi za odobrenje</h1>
          <p className="text-muted-foreground">Odobrite ili odbijte zahtjeve institucija za registraciju</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32" />)}</div>
        ) : pendingList && pendingList.length > 0 ? (
          <div className="space-y-4">
            {pendingList.map(teacher => (
              <Card key={teacher.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <CardTitle className="text-base" data-testid={`text-pending-name-${teacher.id}`}>{teacher.fullName}</CardTitle>
                      <Badge variant="outline">Na čekanju</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setApproveDialog(teacher); setMaxAccounts("30"); }}
                      data-testid={`button-approve-${teacher.id}`}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Odobri
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(teacher.id)}
                      data-testid={`button-reject-${teacher.id}`}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Odbij
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tip institucije:</span>
                      <p className="font-medium">{teacher.institutionType ? typeLabels[teacher.institutionType] || teacher.institutionType : "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uloga:</span>
                      <p className="font-medium">{teacher.institutionRole ? roleLabels[teacher.institutionRole] || teacher.institutionRole : "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Institucija:</span>
                      <p className="font-medium">{teacher.schoolName || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Razred/Grupa:</span>
                      <p className="font-medium">{teacher.className || "-"}</p>
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

        <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Odobri registraciju</DialogTitle>
              <DialogDescription>
                Odobravate račun za <strong>{approveDialog?.fullName}</strong> iz institucije{" "}
                <strong>{approveDialog?.schoolName}</strong>. Odredite maksimalan broj učeničkih računa.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">Maksimalan broj učeničkih računa</label>
              <Input
                type="number"
                value={maxAccounts}
                onChange={e => setMaxAccounts(e.target.value)}
                min="1"
                max="500"
                className="mt-1"
                data-testid="input-max-accounts"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog(null)}>Otkaži</Button>
              <Button
                onClick={() => {
                  if (approveDialog) {
                    approveMutation.mutate({ id: approveDialog.id, maxStudentAccounts: parseInt(maxAccounts) || 30 });
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
