import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, FileQuestion, Mail, TrendingUp, PenTool } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalBooks: number;
  totalQuizzes: number;
  totalMessages: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    { label: "Ukupno korisnika", value: stats?.totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Ukupno knjiga", value: stats?.totalBooks, icon: BookOpen, color: "text-green-600" },
    { label: "Ukupno kvizova", value: stats?.totalQuizzes, icon: FileQuestion, color: "text-orange-600" },
    { label: "Ukupno poruka", value: stats?.totalMessages, icon: Mail, color: "text-orange-600" },
  ];

  const quickActions = [
    { label: "Upravljanje knjigama", description: "Dodajte, uredite ili obrišite knjige", url: "/admin/knjige", icon: BookOpen },
    { label: "Upravljanje kvizovima", description: "Kreirajte kvizove i pitanja", url: "/admin/kvizovi", icon: FileQuestion },
    { label: "Upravljanje korisnicima", description: "Pregledajte i upravljajte korisnicima", url: "/admin/korisnici", icon: Users },
    { label: "Upravljanje blogom", description: "Objavite i uredite članke", url: "/admin/blog", icon: PenTool },
    { label: "Poruke", description: "Pregledajte kontakt poruke", url: "/admin/poruke", icon: Mail },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-title">Administratorska ploča</h1>
          <p className="text-muted-foreground">Pregled i upravljanje platformom Čitanje</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold" data-testid={`text-stat-${stat.label}`}>
                    {stat.value ?? 0}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Brze akcije</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.url} href={action.url}>
                <Card className="hover-elevate cursor-pointer" data-testid={`link-action-${action.url.split("/").pop()}`}>
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <action.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <CardTitle className="text-base">{action.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
