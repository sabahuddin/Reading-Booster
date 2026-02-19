import { useState, useRef, useMemo } from "react";
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
import { Plus, Pencil, Trash2, BookOpen, Upload, Image, FileUp, Star, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";

const GENRES = [
  { value: "lektira", label: "Lektira" },
  { value: "avantura_fantasy", label: "Avantura i Fantasy" },
  { value: "realisticni_roman", label: "Realistični roman" },
  { value: "beletristika", label: "Beletristika" },
  { value: "bajke_basne", label: "Bajke i Basne" },
  { value: "zanimljiva_nauka", label: "Zanimljiva nauka" },
  { value: "poezija", label: "Poezija" },
  { value: "islam", label: "Islam" },
];

const AGE_GROUPS = [
  { value: "M", label: "M – Mlađi osnovci (6-10)" },
  { value: "D", label: "D – Stariji osnovci (11-15)" },
  { value: "O", label: "O – Omladina (15-18)" },
  { value: "A", label: "A – Odrasli (18+)" },
];

import { DifficultyIcon, DIFFICULTY_LABELS } from "@/components/difficulty-icon";

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
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  publicationCity: z.string().optional(),
  isbn: z.string().optional(),
  cobissId: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

const BOOKS_PER_PAGE = 20;

export default function AdminBooks() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bookFileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bookFileUploading, setBookFileUploading] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.genre && b.genre.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
    );
  }, [books, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const paginatedBooks = filteredBooks.slice(
    (safePage - 1) * BOOKS_PER_PAGE,
    safePage * BOOKS_PER_PAGE
  );

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "", author: "", description: "", coverImage: "", content: "",
      ageGroup: "", genre: "lektira", readingDifficulty: "srednje",
      pageCount: 1, pdfUrl: "", purchaseUrl: "", weeklyPick: false,
      publisher: "", publicationYear: new Date().getFullYear(),
      publicationCity: "", isbn: "", cobissId: "",
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

  async function handleDownloadTemplate() {
    try {
      window.open("/api/admin/templates/books", "_blank");
      toast({ title: "Preuzimanje", description: "Šablon se preuzima..." });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    }
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvImporting(true);
    try {
      const formData = new FormData();
      formData.append("csv", file);
      
      const res = await fetch("/api/admin/import/books", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Import failed");
      }
      
      const data = await res.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      const description = data.errors && data.errors.length > 0 
        ? `Uvezeno: ${data.imported || 0}. Greške: ${data.errors.join(", ")}`
        : `Uspješno uvezeno ${data.imported || 0} knjiga.`;
      
      toast({ 
        title: "Import završen", 
        description: description,
        variant: data.errors && data.errors.length > 0 ? "default" : "default"
      });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setCsvImporting(false);
      if (csvInputRef.current) {
        csvInputRef.current.value = "";
      }
    }
  }

  function openCreate() {
    setEditingBook(null);
    form.reset({
      title: "", author: "", description: "", coverImage: "", content: "",
      ageGroup: "", genre: "lektira", readingDifficulty: "srednje",
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
      publisher: book.publisher ?? "",
      publicationYear: book.publicationYear ?? new Date().getFullYear(),
      publicationCity: book.publicationCity ?? "",
      isbn: book.isbn ?? "",
      cobissId: book.cobissId ?? "",
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
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadTemplate} variant="outline" data-testid="button-download-books-template">
              <Download className="mr-2 h-4 w-4" />
              Preuzmi šablon
            </Button>
            <Button onClick={() => csvInputRef.current?.click()} variant="outline" disabled={csvImporting} data-testid="button-import-books-csv">
              <Upload className="mr-2 h-4 w-4" />
              {csvImporting ? "Učitavanje..." : "Uvezi CSV"}
            </Button>
            <input
              type="file"
              ref={csvInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleCsvImport}
              data-testid="input-import-books-file"
            />
            <Button onClick={openCreate} data-testid="button-add-book">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj knjigu
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po naslovu, autoru, žanru ili ISBN-u..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9"
            data-testid="input-search-books"
          />
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
                  {paginatedBooks.length > 0 ? (
                    paginatedBooks.map((book) => (
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
                        <TableCell><DifficultyIcon difficulty={book.readingDifficulty} size="sm" /></TableCell>
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
                        {searchQuery ? "Nema rezultata za vašu pretragu." : "Nema knjiga. Dodajte prvu knjigu."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground" data-testid="text-books-count">
              Prikazano {(safePage - 1) * BOOKS_PER_PAGE + 1}-{Math.min(safePage * BOOKS_PER_PAGE, filteredBooks.length)} od {filteredBooks.length} knjiga
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      variant={safePage === p ? "default" : "outline"}
                      onClick={() => setCurrentPage(p as number)}
                      data-testid={`button-page-${p}`}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                size="icon"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="publisher" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Izdavač</FormLabel>
                      <FormControl><Input {...field} data-testid="input-book-publisher" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="publicationCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mjesto izdavanja</FormLabel>
                      <FormControl><Input {...field} data-testid="input-book-publicationCity" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="publicationYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Godina izdavanja</FormLabel>
                      <FormControl><Input type="number" {...field} data-testid="input-book-publicationYear" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isbn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl><Input {...field} data-testid="input-book-isbn" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cobissId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>COBISS.BH-ID</FormLabel>
                      <FormControl><Input {...field} data-testid="input-book-cobissId" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

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
