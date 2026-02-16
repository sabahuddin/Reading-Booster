import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

const bookFormSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  author: z.string().min(1, "Autor je obavezan"),
  description: z.string().min(1, "Opis je obavezan"),
  coverImage: z.string().min(1, "URL slike je obavezan"),
  content: z.string().min(1, "Sadržaj je obavezan"),
  gradeLevel: z.string().min(1, "Razred je obavezan"),
  pageCount: z.coerce.number().min(1, "Broj stranica mora biti barem 1"),
  pdfUrl: z.string().optional(),
  purchaseUrl: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function AdminBooks() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "", author: "", description: "", coverImage: "", content: "", gradeLevel: "", pageCount: 1, pdfUrl: "", purchaseUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      const payload = { ...data, pdfUrl: data.pdfUrl || null, purchaseUrl: data.purchaseUrl || null };
      await apiRequest("POST", "/api/books", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Knjiga dodana", description: "Nova knjiga je uspješno kreirana." });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      const payload = { ...data, pdfUrl: data.pdfUrl || null, purchaseUrl: data.purchaseUrl || null };
      await apiRequest("PUT", `/api/books/${editingBook!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Knjiga ažurirana", description: "Promjene su uspješno spremljene." });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Knjiga obrisana", description: "Knjiga je uspješno obrisana." });
      setDeleteBook(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  function openCreate() {
    setEditingBook(null);
    form.reset({ title: "", author: "", description: "", coverImage: "", content: "", gradeLevel: "", pageCount: 1, pdfUrl: "", purchaseUrl: "" });
    setDialogOpen(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    form.reset({
      title: book.title,
      author: book.author,
      description: book.description,
      coverImage: book.coverImage,
      content: book.content,
      gradeLevel: book.gradeLevel,
      pageCount: book.pageCount,
      pdfUrl: book.pdfUrl ?? "",
      purchaseUrl: book.purchaseUrl ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingBook(null);
    form.reset();
  }

  function onSubmit(values: BookFormValues) {
    if (editingBook) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-books-title">Upravljanje knjigama</h1>
          </div>
          <Button onClick={openCreate} data-testid="button-add-book">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj knjigu
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naslov</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Razred</TableHead>
                    <TableHead>Stranice</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books && books.length > 0 ? (
                    books.map((book) => (
                      <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.gradeLevel}</TableCell>
                        <TableCell>{book.pageCount}</TableCell>
                        <TableCell>{new Date(book.createdAt).toLocaleDateString("hr-HR")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(book)} data-testid={`button-edit-book-${book.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteBook(book)} data-testid={`button-delete-book-${book.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nema knjiga. Dodajte prvu knjigu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? "Uredi knjigu" : "Dodaj novu knjigu"}</DialogTitle>
              <DialogDescription>
                {editingBook ? "Izmijenite podatke o knjizi." : "Unesite podatke o novoj knjizi."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naslov</FormLabel>
                    <FormControl><Input {...field} data-testid="input-book-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="author" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl><Input {...field} data-testid="input-book-author" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl><Textarea {...field} data-testid="input-book-description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="coverImage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL naslovne slike</FormLabel>
                    <FormControl><Input {...field} data-testid="input-book-coverImage" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sadržaj</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-[120px]" data-testid="input-book-content" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gradeLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razred</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-book-gradeLevel">
                          <SelectValue placeholder="Odaberite razred" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1. razred</SelectItem>
                        <SelectItem value="2">2. razred</SelectItem>
                        <SelectItem value="3">3. razred</SelectItem>
                        <SelectItem value="4">4. razred</SelectItem>
                        <SelectItem value="5">5. razred</SelectItem>
                        <SelectItem value="6">6. razred</SelectItem>
                        <SelectItem value="7">7. razred</SelectItem>
                        <SelectItem value="8">8. razred</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pageCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broj stranica</FormLabel>
                    <FormControl><Input type="number" {...field} data-testid="input-book-pageCount" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pdfUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF / E-book URL</FormLabel>
                    <FormControl><Input placeholder="Link na PDF ili e-book (opcionalno)" {...field} data-testid="input-book-pdfUrl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="purchaseUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link za kupovinu</FormLabel>
                    <FormControl><Input placeholder="Link na online trgovinu (opcionalno)" {...field} data-testid="input-book-purchaseUrl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={isPending} data-testid="button-submit-book">
                    {isPending ? "Spremanje..." : editingBook ? "Spremi promjene" : "Dodaj knjigu"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteBook} onOpenChange={(open) => !open && setDeleteBook(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova radnja je nepovratna. Knjiga "{deleteBook?.title}" će biti trajno obrisana.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Odustani</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteBook && deleteMutation.mutate(deleteBook.id)}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Brisanje..." : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
