import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

type Role = "student" | "teacher" | "parent" | "admin" | "school";

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
  school: [
    { title: "Početna", url: "/skola", icon: SchoolIcon },
  ],
  admin: [
    { title: "Početna", url: "/admin", icon: Home },
    { title: "Knjige", url: "/admin/knjige", icon: BookOpen },
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
  student: "Čitalac",
  teacher: "Učitelj",
  parent: "Roditelj",
  admin: "Administrator",
  school: "Ustanova",
};

interface DashboardLayoutProps {
  role: Role;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const items = menusByRole[role] || [];

  interface SubscriptionStatus {
    subscriptionType: string;
    isFree: boolean;
    quizLimit: number | null;
    quizzesUsed: number;
    quizzesRemaining: number | null;
  }

  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    enabled: role === "student",
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
                {role === "student" && (
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

            {role === "student" && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="px-2">
                    <Link href="/ucenik/pro" data-testid="link-nav-pro">
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
    </SidebarProvider>
  );
}

