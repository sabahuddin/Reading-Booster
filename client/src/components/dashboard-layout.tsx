import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
} from "lucide-react";

type Role = "student" | "teacher" | "parent" | "admin";

interface MenuItem {
  title: string;
  url: string;
  icon: typeof Home;
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
  admin: [
    { title: "Početna", url: "/admin", icon: Home },
    { title: "Knjige", url: "/admin/knjige", icon: BookOpen },
    { title: "Kvizovi", url: "/admin/kvizovi", icon: FileQuestion },
    { title: "Korisnici", url: "/admin/korisnici", icon: Users },
    { title: "Blog", url: "/admin/blog", icon: PenTool },
    { title: "Poruke", url: "/admin/poruke", icon: Mail },
  ],
};

const roleLabels: Record<Role, string> = {
  student: "Učenik",
  teacher: "Učitelj",
  parent: "Roditelj",
  admin: "Administrator",
};

interface DashboardLayoutProps {
  role: Role;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const items = menusByRole[role];

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
          </SidebarContent>
          <SidebarFooter className="p-4">
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
            <span className="text-sm font-medium text-muted-foreground">Čitaj!</span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
