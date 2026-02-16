import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
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
import { Users, Star, Target, GraduationCap, BookOpen } from "lucide-react";
import type { User } from "@shared/schema";

type StudentUser = Omit<User, "password">;

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: students, isLoading } = useQuery<StudentUser[]>({
    queryKey: ["/api/teacher/students"],
  });

  const totalStudents = students?.length ?? 0;
  const avgPoints = totalStudents > 0
    ? Math.round((students!.reduce((sum, s) => sum + s.points, 0)) / totalStudents)
    : 0;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-welcome">
            Dobrodošli, {user?.fullName || "Učitelju"}!
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {user?.schoolName && (
              <Badge variant="secondary" data-testid="badge-school">
                {user.schoolName}
              </Badge>
            )}
            {user?.className && (
              <Badge variant="outline" data-testid="badge-class">
                {user.className}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno učenika</CardTitle>
              <Users className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-students">
                  {totalStudents}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosječni bodovi</CardTitle>
              <Star className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-avg-points">
                  {avgPoints}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Razred</CardTitle>
              <GraduationCap className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-class-info">
                  {user?.className || "—"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover-elevate">
            <Link href="/ucitelj/ucenici" data-testid="link-students-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="text-muted-foreground" />
                  <CardTitle className="text-lg">Učenici</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pregledaj popis učenika i njihove rezultate.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover-elevate">
            <Link href="/ucitelj/biblioteka" data-testid="link-library-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="text-muted-foreground" />
                  <CardTitle className="text-lg">Biblioteka</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pregledaj dostupne knjige u biblioteci.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popis učenika</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !students || students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema učenika u vašem razredu.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Bodovi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id} data-testid={`row-student-${s.id}`}>
                      <TableCell>
                        <Link
                          href={`/ucitelj/ucenici`}
                          className="font-medium underline-offset-4 hover:underline"
                          data-testid={`link-student-${s.id}`}
                        >
                          {s.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.username}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <Star className="mr-1" />
                          {s.points}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
