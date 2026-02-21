import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Home,
  BookOpen,
  Trophy,
  Users,
  FileQuestion,
  Mail,
  LogOut,
  Star,
  GraduationCap,
  Baby,
  PenTool,
  Globe,
  Handshake,
  Award,
  UserCheck,
  TrendingUp,
  School as SchoolIcon,
  Sparkles,
  Tags,
  KeyRound,
} from "lucide-react";

type Role = "student" | "teacher" | "parent" | "admin" | "school" | "school_admin" | "reader";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
}

const menusByRole: Record<Role, MenuItem[]> = {
  student: [
    { title: "Početna", url: "/ucenik", icon: Home },
    { title: "Biblioteka", url: "/ucenik/biblioteka", icon: BookOpen },
    { title: "Moji rezultati", url: "/ucenik/rezultati", icon: Trophy },
  ],
  teacher: [
    { title: "Početna", url: "/ucitelj", icon: Home },
    { title: "Učenici", url: "/ucitelj/ucenici", icon: GraduationCap },
    { title: "Biblioteka", url: "/ucitelj/biblioteka", icon: BookOpen },
  ],
  parent: [
    { title: "Početna", url: "/roditelj", icon: Home },
    { title: "Djeca", url: "/roditelj/djeca", icon: Baby },
  ],
  reader: [
    { title: "Početna", url: "/citanje", icon: Home },
    { title: "Biblioteka", url: "/citanje/biblioteka", icon: BookOpen },
    { title: "Moji rezultati", url: "/citanje/rezultati", icon: Trophy },
  ],
  school: [
    { title: "Početna", url: "/skola", icon: SchoolIcon },
  ],
  school_admin: [
    { title: "Početna", url: "/skola", icon: SchoolIcon },
    { title: "Učitelji", url: "/skola/ucitelji", icon: Users },
  ],
  admin: [
    { title: "Početna", url: "/admin", icon: Home },
    { title: "Knjige", url: "/admin/knjige", icon: BookOpen },
    { title: "Žanrovi", url: "/admin/zanrovi", icon: Tags },
    { title: "Kvizovi", url: "/admin/kvizovi", icon: FileQuestion },
    { title: "Korisnici", url: "/admin/korisnici", icon: Users },
    { title: "Odobrenja", url: "/admin/odobrenja", icon: UserCheck },
    { title: "Partneri", url: "/admin/partneri", icon: Handshake },
    { title: "Izazovi", url: "/admin/izazovi", icon: Award },
    { title: "Blog", url: "/admin/blog", icon: PenTool },
    { title: "Poruke", url: "/admin/poruke", icon: Mail },
  ],
};

const roleLabels: Record<Role, string> = {
  student: "Učenik",
  teacher: "Učitelj",
  parent: "Roditelj",
  admin: "Administrator",
  school: "Ustanova",
  school_admin: "Školski administrator",
  reader: "Čitalac",
};

interface DashboardLayoutProps {
  role: Role;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const items = menusByRole[role] || [];
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const canChangePassword = role !== "student";

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/change-password", { currentPassword, newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lozinka uspješno promijenjena." });
      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    },
  });

  function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      toast({ title: "Popunite sva polja.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Nove lozinke se ne poklapaju.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Nova lozinka mora imati najmanje 8 karaktera.", variant: "destructive" });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast({ title: "Nova lozinka mora sadržavati veliko slovo.", variant: "destructive" });
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast({ title: "Nova lozinka mora sadržavati broj.", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  }

  interface SubscriptionStatus {
    subscriptionType: string;
    isFree: boolean;
    quizLimit: number | null;
    quizzesUsed: number;
    quizzesRemaining: number | null;
  }

  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    enabled: role === "student" || role === "reader",
  });

  const isPro = subscription && !subscription.isFree;

  const style = { "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-bold" data-testid="text-sidebar-name">
                {user?.fullName || "Korisnik"}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" data-testid="badge-role">
                  {roleLabels[role]}
                </Badge>
                {(role === "student" || role === "reader") && (
                  <Badge variant="default" data-testid="badge-points">
                    <Star className="mr-1" />
                    {user?.points ?? 0} bodova
                  </Badge>
                )}
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Izbornik</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        tooltip={item.title}
                      >
                        <Link href={item.url} data-testid={`link-nav-${item.url.split("/").pop()}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {(role === "student" || role === "reader") && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="px-2">
                    <Link href={role === "reader" ? "/citanje/pro" : "/ucenik/pro"} data-testid="link-nav-pro">
                      <div className={`p-3 rounded-md border ${isPro ? "border-primary/30 bg-primary/5" : "border-dashed border-primary/40 bg-primary/5"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-bold text-sm">Čitalac Pro</span>
                          {isPro ? (
                            <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0">Aktivan</Badge>
                          ) : (
                            <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 border-primary text-primary">Upgrade</Badge>
                          )}
                        </div>
                        {!isPro && subscription && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                              <span>Kvizovi: {subscription.quizzesUsed}/{subscription.quizLimit}</span>
                              <span>{subscription.quizzesRemaining} preostalo</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(subscription.quizzesUsed / (subscription.quizLimit || 3)) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="p-4 flex flex-col gap-1">
            {canChangePassword && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setPasswordOpen(true)}
                data-testid="button-change-password"
              >
                <KeyRound className="shrink-0" />
                <span>Promijeni lozinku</span>
              </Button>
            )}
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                data-testid="link-public-site"
              >
                <Globe className="shrink-0" />
                <span>Početna stranica</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              data-testid="button-logout"
            >
              <LogOut className="shrink-0" />
              <span>Odjava</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 border-b p-3 sticky top-0 bg-background z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <span className="text-sm font-medium text-muted-foreground">Čitanje</span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {canChangePassword && (
        <Dialog open={passwordOpen} onOpenChange={(v) => { if (!v) { setPasswordOpen(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promijeni lozinku</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Trenutna lozinka</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova lozinka</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdi novu lozinku</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo i jedan broj.
              </p>
              <Button
                className="w-full"
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                data-testid="button-submit-change-password"
              >
                {changePasswordMutation.isPending ? "Mijenjam..." : "Promijeni lozinku"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  );
}

