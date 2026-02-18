import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, GraduationCap, Star, TrendingUp, Trophy, Target, BookOpen } from "lucide-react";

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

export default function SchoolDashboard() {
  const { user } = useAuth();

  if (!user || (user.role !== "school" && user.role !== "admin")) {
    return <Redirect to="/" />;
  }

  const { data: stats, isLoading } = useQuery<SchoolStats>({
    queryKey: ["/api/school/stats"],
  });

  return (
    <DashboardLayout role="school">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-school-title">
            {stats?.schoolName || user.schoolName || "Ustanova"}
          </h1>
          <p className="text-muted-foreground">
            Kontrolna tabla ustanove — pregled statistike i napretka.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno učenika</CardTitle>
              <Users className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-students">{stats?.totalStudents ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nastavnici</CardTitle>
              <GraduationCap className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-teachers">{stats?.totalTeachers ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Riješeno kvizova</CardTitle>
              <Target className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-quizzes">{stats?.totalQuizzes ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosječni bodovi</CardTitle>
              <TrendingUp className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold" data-testid="text-stat-avg">{stats?.avgPoints ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-muted-foreground" />
                Top 10 učenika
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : !stats?.topStudents?.length ? (
                <div className="text-center py-8">
                  <Trophy className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Nema podataka o učenicima.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rang</TableHead>
                      <TableHead>Ime</TableHead>
                      <TableHead>Razred</TableHead>
                      <TableHead>Bodovi</TableHead>
                      <TableHead>Kvizovi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topStudents.map((s, i) => (
                      <TableRow key={s.id} data-testid={`row-top-student-${i}`}>
                        <TableCell>
                          <Badge variant={i < 3 ? "default" : "secondary"}>#{i + 1}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{s.fullName}</TableCell>
                        <TableCell>{s.className || "/"}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            <Star className="mr-1" />
                            {s.points}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.quizzes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="text-muted-foreground" />
                Nastavnici
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : !stats?.teachers?.length ? (
                <div className="text-center py-8">
                  <GraduationCap className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Nema nastavnika u sistemu.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime</TableHead>
                      <TableHead>Razred</TableHead>
                      <TableHead>Broj učenika</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.teachers.map((t) => (
                      <TableRow key={t.id} data-testid={`row-teacher-${t.id}`}>
                        <TableCell className="font-medium">{t.fullName}</TableCell>
                        <TableCell>{t.className || "/"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t.studentCount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {stats?.classes && stats.classes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground" />
                Statistika po razredima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razred</TableHead>
                    <TableHead>Učenika</TableHead>
                    <TableHead>Ukupno bodova</TableHead>
                    <TableHead>Kvizova</TableHead>
                    <TableHead>Prosječni bodovi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.classes.map((c) => (
                    <TableRow key={c.name} data-testid={`row-class-${c.name}`}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.students}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <Star className="mr-1" />
                          {c.points}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.quizzes}</TableCell>
                      <TableCell>{c.students > 0 ? Math.round(c.points / c.students) : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
