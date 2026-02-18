import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

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

  const totalBooks = students.reduce((sum: number, s: any) => {
    const booksRead = s.booksRead || 0;
    return sum + booksRead;
  }, 0);

  const avgBooksPerStudent =
    students.length > 0 ? (totalBooks / students.length).toFixed(1) : 0;

  const topStudents = [...students]
    .sort((a: any, b: any) => (b.booksRead || 0) - (a.booksRead || 0))
    .slice(0, 5);

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

        {topStudents.length > 0 && (
          <Card data-testid="card-top-readers">
            <CardHeader>
              <CardTitle>Top 5 čitalaca ovog mjeseca</CardTitle>
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
                      <TableCell className="font-medium">{student.fullName}</TableCell>
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
