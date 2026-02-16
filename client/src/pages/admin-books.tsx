import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, BookOpen, Upload, Image, FileUp, Star } from "lucide-react";

const GENRES = [
  { value: "bajke", label: "Bajke i priče" },
  { value: "avantura", label: "Avantura" },
  { value: "fantazija", label: "Fantazija" },
  { value: "roman", label: "Roman" },
  { value: "poezija", label: "Poezija" },
  { value: "nauka", label: "Nauka i znanje" },
  { value: "historija", label: "Historija" },
  { value: "biografija", label: "Biografija" },
  { value: "humor", label: "Humor" },
  { value: "misterija", label: "Misterija" },
  { value: "drama", label: "Drama" },
  { value: "ostalo", label: "Ostalo" },
];

const AGE_GROUPS = [
  { value: "6-7", label: "6-7 godina" },
  { value: "8-9", label: "8-9 godina" },
  { value: "10-11", label: "10-11 godina" },
  { value: "12-13", label: "12-13 godina" },
  { value: "14-15", label: "14-15 godina" },
  { value: "16+", label: "16+ godina" },
];

const DIFFICULTY_LABELS: Record<string, string> = {
  lako: "Lako",
  srednje: "Srednje",
  tesko: "Teško",
};

const bookFormSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  author: z.string().min(1, "Autor je obavezan"),
  description: z.string().min(1, "Opis je obavezan"),
  coverImage: z.string().min(1, "Naslovna slika je obavezna"),
  content: z.string().min(1, "Sadržaj je obavezan"),
  ageGroup: z.string().min(1, "Dobna skupina je obavezna"),
  genre: z.string().min(1, "Žanr je obavezan"),
  readingDifficulty: z.enum(["lako", "srednje", "tesko"]),
  pageCount: z.coerce.number().min(1, "Broj stranica mora biti barem 1"),
  pdfUrl: z.string().optional(),
  purchaseUrl: z.string().optional(),
  weeklyPick: z.boolean().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function AdminBooks() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bookFileInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bookFileUploading, setBookFileUploading] = useState(false);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "", author: "", description: "", coverImage: "", content: "",
      ageGroup: "", genre: "ostalo", readingDifficulty: "srednje",
      pageCount: 1, pdfUrl: "", purchaseUrl: "", weeklyPick: false,
    },
  });

  async function uploadFile(file: File, type: "cover" | "book"): Promise<string> {
    const formData = new FormData();
    formData.append(type, file);
    const res = await fetch(`/api/upload/${type}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Upload failed");
    }
    const data = await res.json();
    return data.url;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadFile(file, "cover");
      form.setValue("coverImage", url);
      toast({ title: "Slika uploadovana", description: "Naslovna slika je uspješno postavljena." });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleBookFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBookFileUploading(true);
    try {
      const url = await uploadFile(file, "book");
      form.setValue("pdfUrl", url);
      toast({ title: "Knjiga uploadovana", description: "PDF/e-book datoteka je uspješno postavljena." });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setBookFileUploading(false);
    }
  }

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
    form.reset({
      title: "", author: "", description: "", coverImage: "", content: "",
      ageGroup: "", genre: "ostalo", readingDifficulty: "srednje",
      pageCount: 1, pdfUrl: "", purchaseUrl: "", weeklyPick: false,
    });
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
      ageGroup: book.ageGroup,
      genre: book.genre,
      readingDifficulty: book.readingDifficulty as "lako" | "srednje" | "tesko",
      pageCount: book.pageCount,
      pdfUrl: book.pdfUrl ?? "",
      purchaseUrl: book.purchaseUrl ?? "",
      weeklyPick: book.weeklyPick,
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
  const genreLabel = (v: string) => GENRES.find((g) => g.value === v)?.label ?? v;
  const ageLabel = (v: string) => AGE_GROUPS.find((a) => a.value === v)?.label ?? v;

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
                    <TableHead>Dob</TableHead>
                    <TableHead>Žanr</TableHead>
                    <TableHead>Težina</TableHead>
                    <TableHead>Str.</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books && books.length > 0 ? (
                    books.map((book) => (
                      <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {book.weeklyPick && <Star className="h-4 w-4 text-yellow-500" />}
                            {book.title}
                          </div>
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{ageLabel(book.ageGroup)}</TableCell>
                        <TableCell><Badge variant="secondary">{genreLabel(book.genre)}</Badge></TableCell>
                        <TableCell>{DIFFICULTY_LABELS[book.readingDifficulty] ?? book.readingDifficulty}</TableCell>
                        <TableCell>{book.pageCount}</TableCell>
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
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
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
                    <FormLabel>Naslovna slika</FormLabel>
                    <div className="space-y-2">
                      {field.value && (
                        <div className="w-24 h-32 rounded-md overflow-hidden bg-muted border">
                          <img src={field.value} alt="Cover preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={coverInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverUpload}
                          data-testid="input-cover-file"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={coverUploading}
                          data-testid="button-upload-cover"
                        >
                          <Image className="mr-2 h-4 w-4" />
                          {coverUploading ? "Uploadovanje..." : "Uploaduj sliku"}
                        </Button>
                        <span className="text-xs text-muted-foreground">ili</span>
                        <FormControl>
                          <Input placeholder="URL slike" {...field} data-testid="input-book-coverImage" className="flex-1" />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sadržaj / Opis knjige</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-[120px]" data-testid="input-book-content" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="ageGroup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dobna skupina</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-book-ageGroup">
                            <SelectValue placeholder="Odaberite dob" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGE_GROUPS.map((ag) => (
                            <SelectItem key={ag.value} value={ag.value}>{ag.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="genre" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Žanr</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-book-genre">
                            <SelectValue placeholder="Odaberite žanr" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENRES.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="readingDifficulty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Težina čitanja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-book-difficulty">
                            <SelectValue placeholder="Odaberite težinu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lako">Lako</SelectItem>
                          <SelectItem value="srednje">Srednje</SelectItem>
                          <SelectItem value="tesko">Teško</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="pageCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broj stranica</FormLabel>
                    <FormControl><Input type="number" {...field} data-testid="input-book-pageCount" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="pdfUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF / E-book datoteka</FormLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bookFileInputRef}
                        accept=".pdf,.epub,.mobi"
                        className="hidden"
                        onChange={handleBookFileUpload}
                        data-testid="input-book-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => bookFileInputRef.current?.click()}
                        disabled={bookFileUploading}
                        data-testid="button-upload-book-file"
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        {bookFileUploading ? "Uploadovanje..." : "Uploaduj datoteku"}
                      </Button>
                      <span className="text-xs text-muted-foreground">ili</span>
                      <FormControl>
                        <Input placeholder="Link na PDF (opcionalno)" {...field} data-testid="input-book-pdfUrl" className="flex-1" />
                      </FormControl>
                    </div>
                    {field.value && (
                      <p className="text-xs text-muted-foreground mt-1">Trenutna datoteka: {field.value}</p>
                    )}
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

                <FormField control={form.control} name="weeklyPick" render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                        data-testid="input-book-weeklyPick"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Prijedlog sedmice
                    </FormLabel>
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
