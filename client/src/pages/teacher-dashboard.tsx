import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, type FormEvent } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  AlertCircle,
  Plus,
  Mail,
  Star,
  UserPlus,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GENRE_LABELS: Record<string, string> = {
  lektira: "Lektira",
  avantura_fantasy: "Avantura i Fantasy",
  roman: "Roman",
  beletristika: "Beletristika",
  bajke_basne: "Bajke i Basne",
  zanimljiva_nauka: "Zanimljiva nauka",
  poezija: "Poezija",
  islam: "Islam",
};

const CHART_COLORS = [
  "#FF861C", "#4A90D9", "#50C878", "#9B59B6",
  "#E74C3C", "#F39C12", "#1ABC9C", "#E67E22",
  "#3498DB", "#2ECC71",
];

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState("");
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/teacher/students"],
  });

  const { data: inactiveStudents = [] } = useQuery<any[]>({
    queryKey: ["/api/teacher/inactive-students"],
  });

  const { data: books = [] } = useQuery<any[]>({
    queryKey: ["/api/books"],
  });

  const { data: parentRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/teacher/parent-requests"],
  });

  const { data: classStats } = useQuery<{
    studentStats: Array<{
      id: string;
      fullName: string;
      points: number;
      booksRead: number;
      quizzesTaken: number;
      avgScore: number;
    }>;
    genreDistribution: Array<{ name: string; count: number }>;
  }>({
    queryKey: ["/api/teacher/class-stats"],
  });

  const handleParentRequest = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/teacher/parent-request/${requestId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/parent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
      toast({ title: "Zahtjev obrađen" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const pendingParentRequests = parentRequests.filter((r: any) => r.status === "pending");

  const totalBooks = students.reduce((sum: number, s: any) => {
    const booksRead = s.booksRead || 0;
    return sum + booksRead;
  }, 0);

  const avgBooksPerStudent =
    students.length > 0 ? (totalBooks / students.length).toFixed(1) : 0;

  const topStudents = [...students]
    .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);

  const barData = (classStats?.studentStats || [])
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map(s => ({
      name: s.fullName.split(" ")[0],
      bodovi: s.points,
      kvizovi: s.quizzesTaken,
    }));

  const pieData = (classStats?.genreDistribution || []).map(g => ({
    name: GENRE_LABELS[g.name] || g.name,
    value: g.count,
  }));

  const handleAddBonus = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/teacher/bonus-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: selectedStudent?.id,
          points: parseInt(formData.get("points") as string),
          reason: formData.get("reason") as string,
        }),
      });

      if (response.ok) {
        toast({ title: "Bonus bodovi dodati!" });
        setBonusDialogOpen(false);
        setSelectedStudent(null);
        queryClient.invalidateQueries({ queryKey: ["/api/teacher/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/teacher/class-stats"] });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće dodati bonus bodove",
        variant: "destructive",
      });
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedBook) {
      toast({
        title: "Greška",
        description: "Morate odabrati knjigu",
        variant: "destructive",
      });
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await fetch("/api/teacher/class-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          className: students[0]?.className || "Razred",
          bookId: selectedBook,
          challengeType: "book_of_week",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          bonusPoints: 10,
          description: "Sedmični izazov čitanja",
        }),
      });

      if (response.ok) {
        toast({ title: "Sedmični izazov kreiran!" });
        setSelectedBook("");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće kreirati izazov",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <Card data-testid="card-class-overview">
          <CardHeader>
            <CardTitle>Pregled razreda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold" data-testid="text-total-students">
                  {students.length}
                </div>
                <div className="text-sm text-muted-foreground">Učenika</div>
              </div>
              <div className="text-center">
                <BookOpen className="mx-auto h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold" data-testid="text-total-books">
                  {totalBooks}
                </div>
                <div className="text-sm text-muted-foreground">Pročitanih knjiga</div>
              </div>
              <div className="text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold" data-testid="text-avg-books">
                  {avgBooksPerStudent}
                </div>
                <div className="text-sm text-muted-foreground">Prosječno po učeniku</div>
              </div>
              <div className="text-center">
                <Award className="mx-auto h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold" data-testid="text-achievers">
                  {students.filter((s: any) => (s.booksRead || 0) >= 10).length}
                </div>
                <div className="text-sm text-muted-foreground">Učenika sa 10+ knjiga</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {barData.length > 0 && (
            <Card data-testid="card-bar-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Bodovi po učeniku
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === "bodovi" ? "Bodovi" : "Kvizovi",
                      ]}
                    />
                    <Bar dataKey="bodovi" fill="#FF861C" radius={[4, 4, 0, 0]} name="bodovi" />
                    <Bar dataKey="kvizovi" fill="#4A90D9" radius={[4, 4, 0, 0]} name="kvizovi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {pieData.length > 0 && (
            <Card data-testid="card-pie-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Čitanje po žanrovima
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      formatter={(value: number) => [`${value} kvizova`, "Broj"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {classStats?.studentStats && classStats.studentStats.length > 0 && (
          <Card data-testid="card-student-progress">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Napredak učenika
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classStats.studentStats
                  .sort((a, b) => b.points - a.points)
                  .map((s, i) => {
                    const maxPoints = classStats.studentStats[0]?.points || 1;
                    const pct = maxPoints > 0 ? Math.round((s.points / maxPoints) * 100) : 0;
                    return (
                      <div key={s.id} className="flex items-center gap-3" data-testid={`progress-student-${i}`}>
                        <div className="w-8 text-center">
                          <Badge variant={i < 3 ? "default" : "secondary"} className="text-xs">
                            {i + 1}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">{s.fullName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {s.points} bod. | {s.quizzesTaken} kviz. | {s.avgScore}% tačno
                            </span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: i === 0 ? "#FF861C" : i === 1 ? "#F59E0B" : i === 2 ? "#84CC16" : "#94A3B8",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {topStudents.length > 0 && (
          <Card data-testid="card-top-readers">
            <CardHeader>
              <CardTitle>Top 5 čitalaca</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rang</TableHead>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Pročitano knjiga</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStudents.map((student: any, index: number) => (
                    <TableRow key={student.id} data-testid={`row-top-student-${index}`}>
                      <TableCell>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.firstName && student.lastName
                          ? `${student.firstName} ${student.lastName}`
                          : student.fullName || student.username}
                      </TableCell>
                      <TableCell>{student.booksRead || 0}</TableCell>
                      <TableCell>{student.points || 0}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-bonus-${student.id}`}
                          onClick={() => {
                            setSelectedStudent(student);
                            setBonusDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Bonus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {inactiveStudents.length > 0 && (
          <Card data-testid="card-inactive-students">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-yellow-500" />
                Učenici bez aktivnosti (7+ dana)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inactiveStudents.map((student: any) => (
                  <Alert key={student.id} data-testid={`alert-inactive-${student.id}`}>
                    <AlertTitle>{student.fullName}</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-sm">
                        Posljednja aktivnost:{" "}
                        {student.lastActivity
                          ? new Date(student.lastActivity).toLocaleDateString()
                          : "Nikad"}
                      </span>
                      <Button size="sm" variant="outline" data-testid={`button-contact-${student.id}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Kontaktiraj roditelja
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="card-weekly-challenge">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="text-yellow-500" />
              Postavi sedmični izazov
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger data-testid="select-challenge-book">
                <SelectValue placeholder="Odaberi knjigu sedmice" />
              </SelectTrigger>
              <SelectContent>
                {books.map((book: any) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              onClick={handleCreateChallenge}
              disabled={!selectedBook}
              data-testid="button-create-challenge"
            >
              Postavi kao sedmični izazov (+10 bonus bodova)
            </Button>
          </CardContent>
        </Card>
      </div>

      {pendingParentRequests.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Zahtjevi roditelja ({pendingParentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingParentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">{req.parentName}</p>
                    <p className="text-sm text-muted-foreground">
                      želi se povezati s učenikom <strong>{req.studentName}</strong> ({req.studentUsername})
                    </p>
                    {req.parentEmail && <p className="text-xs text-muted-foreground">{req.parentEmail}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleParentRequest.mutate({ requestId: req.id, status: "approved" })}
                      disabled={handleParentRequest.isPending}
                      data-testid={`button-approve-parent-${req.id}`}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Odobri
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleParentRequest.mutate({ requestId: req.id, status: "rejected" })}
                      disabled={handleParentRequest.isPending}
                      data-testid={`button-reject-parent-${req.id}`}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Odbij
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj bonus bodove</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBonus}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Učenik</label>
                <Input value={selectedStudent?.fullName || ""} disabled data-testid="input-bonus-student" />
              </div>
              <div>
                <label className="text-sm font-medium">Broj bodova</label>
                <Input
                  name="points"
                  type="number"
                  min="1"
                  max="50"
                  required
                  placeholder="npr. 10"
                  data-testid="input-bonus-points"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Razlog</label>
                <Textarea
                  name="reason"
                  required
                  placeholder="npr. Izvrsna prezentacija o knjizi"
                  data-testid="input-bonus-reason"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-bonus">
                Dodaj bonus bodove
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
