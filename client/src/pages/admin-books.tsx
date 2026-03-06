import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Book, Genre, Quiz } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, BookOpen, Upload, Image, ImageOff, FileUp, Star, Download, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle, FolderArchive, RefreshCw, CheckCircle2 } from "lucide-react";

type BookWithGenres = Book & { genres?: Genre[] };

const AGE_GROUPS = [
  { value: "R1", label: "Od 1. razreda" },
  { value: "R4", label: "Od 4. razreda" },
  { value: "R7", label: "Od 7. razreda" },
  { value: "O", label: "Omladina" },
  { value: "A", label: "Odrasli" },
];

import { DifficultyIcon, DIFFICULTY_LABELS } from "@/components/difficulty-icon";

const bookFormSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  author: z.string().min(1, "Autor je obavezan"),
  description: z.string().min(1, "Opis je obavezan"),
  coverImage: z.string().min(1, "Naslovna slika je obavezna"),
  ageGroup: z.string().min(1, "Dobna skupina je obavezna"),
  genre: z.string().optional(),
  readingDifficulty: z.enum(["lako", "srednje", "tesko"]),
  language: z.string().optional(),
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

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function AdminBooks() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookWithGenres | null>(null);
  const [deleteBook, setDeleteBook] = useState<BookWithGenres | null>(null);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bookFileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const coverCsvInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bookFileUploading, setBookFileUploading] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [coverCsvImporting, setCoverCsvImporting] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [zipUploading, setZipUploading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(20);
  const [sortField, setSortField] = useState<"title" | "author" | "createdAt" | null>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterNoCover, setFilterNoCover] = useState(false);
  const [filterNoQuiz, setFilterNoQuiz] = useState(false);
  const [filterGenreId, setFilterGenreId] = useState<string>("");
  const [filterNoDescription, setFilterNoDescription] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const { data: books, isLoading } = useQuery<BookWithGenres[]>({
    queryKey: ["/api/books"],
  });

  const { data: allGenres } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });

  const { data: quizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const booksWithQuizSet = useMemo(() => {
    if (!quizzes) return new Set<string>();
    return new Set(quizzes.map(q => q.bookId));
  }, [quizzes]);

  const bookQuizInfo = useMemo(() => {
    if (!quizzes) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const q of quizzes as any[]) {
      const current = map.get(q.bookId) || 0;
      map.set(q.bookId, current + (q.questionCount || 0));
    }
    return map;
  }, [quizzes]);

  function toggleSort(field: "title" | "author" | "createdAt") {
    if (sortField === field) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "createdAt" ? "desc" : "asc");
    }
    setCurrentPage(1);
  }

  function fmtDate(d: string | Date | null | undefined): string {
    if (!d) return "—";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
  }

  function isMissingCover(b: BookWithGenres) {
    return !b.coverImage || b.coverImage.trim() === "" || b.coverImage.includes("placeholder");
  }

  const noCoverCount = useMemo(() => {
    if (!books) return 0;
    return books.filter(isMissingCover).length;
  }, [books]);

  const noQuizCount = useMemo(() => {
    if (!books) return 0;
    return books.filter(b => !booksWithQuizSet.has(b.id)).length;
  }, [books, booksWithQuizSet]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    let result = books;
    if (filterNoCover) {
      result = result.filter(isMissingCover);
    }
    if (filterNoQuiz) {
      result = result.filter(b => !booksWithQuizSet.has(b.id));
    }
    if (filterGenreId) {
      result = result.filter(b => b.genres && b.genres.some(g => g.id === filterGenreId));
    }
    if (filterNoDescription) {
      result = result.filter(b => !b.description || b.description.trim() === "");
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.genres && b.genres.some(g => g.name.toLowerCase().includes(q))) ||
          (b.genre && b.genre.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        if (sortField === "createdAt") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return sortDir === "asc" ? tA - tB : tB - tA;
        }
        const valA = (a[sortField] as string).toLowerCase();
        const valB = (b[sortField] as string).toLowerCase();
        return sortDir === "asc" ? valA.localeCompare(valB, "hr") : valB.localeCompare(valA, "hr");
      });
    }
    return result;
  }, [books, searchQuery, sortField, sortDir, filterNoCover, filterNoQuiz, filterGenreId, filterNoDescription, booksWithQuizSet]);

  const noDescCount = useMemo(() => {
    if (!books) return 0;
    return books.filter(b => !b.description || b.description.trim() === "").length;
  }, [books]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const paginatedBooks = filteredBooks.slice(
    (safePage - 1) * booksPerPage,
    safePage * booksPerPage
  );

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "", author: "", description: "", coverImage: "",
      ageGroup: "", genre: "", readingDifficulty: "srednje",
      language: "bosanski", pageCount: 1, pdfUrl: "", purchaseUrl: "", weeklyPick: false,
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
      const firstGenreSlug = allGenres?.find(g => selectedGenreIds.includes(g.id))?.slug ?? "";
      const payload = { ...data, content: data.description, genre: firstGenreSlug, pdfUrl: data.pdfUrl || null, purchaseUrl: data.purchaseUrl || null, genreIds: selectedGenreIds };
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
      const firstGenreSlug = allGenres?.find(g => selectedGenreIds.includes(g.id))?.slug ?? "";
      const payload = { ...data, content: data.description, genre: firstGenreSlug, pdfUrl: data.pdfUrl || null, purchaseUrl: data.purchaseUrl || null, genreIds: selectedGenreIds };
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
      
      let description = `Uspješno uvezeno ${data.imported || 0} knjiga.`;
      if (data.updatedCovers > 0) {
        description += ` Ažurirano ${data.updatedCovers} korica.`;
      }
      if (data.skipped > 0) {
        description += ` Preskočeno ${data.skipped} duplikata.`;
      }
      if (data.errors && data.errors.length > 0) {
        description += ` Greške: ${data.errors.join(", ")}`;
      }
      
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

  async function handleCleanupBooks() {
    setCleaningUp(true);
    try {
      const res = await fetch("/api/admin/cleanup-books", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Čišćenje nije uspjelo");
      }
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });

      let description = "";
      if (data.titlesCleaned > 0) {
        description += `Očišćeno ${data.titlesCleaned} naslova. `;
      }
      if (data.descsCleaned > 0) {
        description += `Očišćeno ${data.descsCleaned} opisa. `;
      }
      if (data.titlesCleaned === 0 && data.descsCleaned === 0) {
        description = "Sve je već čisto, nema promjena.";
      }

      toast({ title: "Čišćenje završeno", description });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setCleaningUp(false);
    }
  }

  const [coverProgress, setCoverProgress] = useState("");
  const [pendingReview, setPendingReview] = useState<Array<{ bookId: string; bookTitle: string; bookAuthor: string; foundTitle: string; imageUrl: string; similarityScore: number }>>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    async function loadPendingReview() {
      try {
        const res = await fetch("/api/admin/fetch-covers/status");
        if (!res.ok) return;
        const status = await res.json();
        if (status.pendingReview && status.pendingReview.length > 0) {
          setPendingReview(status.pendingReview);
        }
        if (status.running) {
          setMigrating(true);
          setCoverProgress(`${status.processed}/${status.total} obrađeno — ${status.found} pronađeno`);
          pollRef.current = setInterval(async () => {
            try {
              const sRes = await fetch("/api/admin/fetch-covers/status");
              if (!sRes.ok) return;
              const s = await sRes.json();
              const pendingText = s.pendingCount > 0 ? `, ${s.pendingCount} čeka odobrenje` : "";
              setCoverProgress(`${s.processed}/${s.total} obrađeno — ${s.found} pronađeno, ${s.failed} bez korice${pendingText}`);
              if (s.done) {
                stopPolling();
                setMigrating(false);
                queryClient.invalidateQueries({ queryKey: ["/api/books"] });
                if (s.pendingReview && s.pendingReview.length > 0) {
                  setPendingReview(s.pendingReview);
                }
              }
            } catch {}
          }, 2000);
        }
      } catch {}
    }
    loadPendingReview();
  }, []);

  async function handleMigrateCovers() {
    setMigrating(true);
    setCoverProgress("Pokrećem pretragu...");
    try {
      const res = await fetch("/api/admin/fetch-covers", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Pretraga korica nije uspjela");
      }
      const data = await res.json();
      setCoverProgress(`Pretraga pokrenuta: ${data.total} knjiga bez korica`);
      toast({ title: "Pretraga pokrenuta", description: `${data.total} knjiga za obradu. Pratite progres.` });

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/admin/fetch-covers/status");
          if (!statusRes.ok) return;
          const status = await statusRes.json();
          const pendingText = status.pendingCount > 0 ? `, ${status.pendingCount} čeka odobrenje` : "";
          setCoverProgress(`${status.processed}/${status.total} obrađeno — ${status.found} pronađeno, ${status.failed} bez korice${pendingText}`);
          if (status.done) {
            stopPolling();
            setMigrating(false);
            queryClient.invalidateQueries({ queryKey: ["/api/books"] });
            if (status.pendingReview && status.pendingReview.length > 0) {
              setPendingReview(status.pendingReview);
              toast({
                title: "Pretraga završena",
                description: `${status.found} pronađeno automatski, ${status.pendingReview.length} čeka vaše odobrenje.`,
              });
            } else {
              toast({
                title: "Pretraga korica završena",
                description: `Pronađeno ${status.found} korica od ${status.total} knjiga. Neuspješno: ${status.failed}.`,
              });
              setTimeout(() => setCoverProgress(""), 10000);
            }
          }
        } catch {}
      }, 2000);
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
      setMigrating(false);
      setCoverProgress("");
    }
  }

  async function handleApprove(bookId: string, imageUrl: string) {
    try {
      await fetch("/api/admin/fetch-covers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, imageUrl }),
      });
      setPendingReview(prev => prev.filter(c => c.bookId !== bookId));
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Korica odobrena" });
    } catch {}
  }

  async function handleReject(bookId: string) {
    try {
      await fetch("/api/admin/fetch-covers/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      setPendingReview(prev => prev.filter(c => c.bookId !== bookId));
    } catch {}
  }

  async function handleApproveAll() {
    for (const item of pendingReview) {
      await handleApprove(item.bookId, item.imageUrl);
    }
    setPendingReview([]);
    setCoverProgress("");
  }

  async function handleRejectAll() {
    for (const item of pendingReview) {
      await handleReject(item.bookId);
    }
    setPendingReview([]);
    setCoverProgress("");
  }

  async function handleMigrateExternalToLocal() {
    setMigrating(true);
    setCoverProgress("Pokrećem migraciju eksternih korica na server...");
    try {
      const res = await fetch("/api/admin/migrate-covers-local", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Migracija nije uspjela");
      }
      toast({ title: "Migracija pokrenuta", description: "Preuzimanje eksternih slika na server u toku." });

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/admin/fetch-covers/status");
          if (!statusRes.ok) return;
          const status = await statusRes.json();
          if (status.logs && status.logs.length > 0) {
            setCoverProgress(status.logs[status.logs.length - 1]);
          }
          if (status.done) {
            stopPolling();
            setMigrating(false);
            queryClient.invalidateQueries({ queryKey: ["/api/books"] });
            toast({ title: "Migracija završena", description: status.logs[status.logs.length - 1] || "Sve korice su preuzete." });
            setTimeout(() => setCoverProgress(""), 10000);
          }
        } catch {}
      }, 2000);
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
      setMigrating(false);
      setCoverProgress("");
    }
  }

  async function handleZipUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setZipUploading(true);
    try {
      const formData = new FormData();
      formData.append("zip", file);
      
      const res = await fetch("/api/admin/upload/covers-zip", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }
      
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      
      let description = `Ažurirano ${data.updated} korica.`;
      if (data.notFound > 0) {
        description += ` Nije pronađeno ${data.notFound}: ${data.notFoundTitles?.slice(0, 5).join(", ")}${data.notFoundTitles?.length > 5 ? "..." : ""}`;
      }
      if (data.skipped > 0) {
        description += ` Preskočeno ${data.skipped} ne-slika.`;
      }
      
      toast({ title: "ZIP upload završen", description });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setZipUploading(false);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  }

  function downloadNoQuizCsv() {
    const noQuizBooks = (books || []).filter(b => !booksWithQuizSet.has(b.id));
    const headers = "title,author,ageGroup";
    const rows = noQuizBooks.map(b => `"${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}","${b.ageGroup || ""}"`);
    const csv = "\uFEFF" + headers + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knjige_bez_kviza.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Preuzimanje", description: `CSV sa ${noQuizBooks.length} knjiga bez kviza se preuzima...` });
  }

  function downloadFilteredBooksCsv() {
    const booksToExport = filteredBooks;
    const headers = "title;author;description;ageGroup;genre;readingDifficulty;pageCount;publisher;publicationYear;publicationCity;isbn;cobissId;language;bookFormat;coverImage;pdfUrl;purchaseUrl;weeklyPick";
    const rows = booksToExport.map(b => {
      const genreNames = b.genres ? b.genres.map(g => g.name).join(", ") : (b.genre || "");
      return [
        b.title, b.author, b.description || "", b.ageGroup || "", genreNames,
        b.readingDifficulty || "", b.pageCount || "", b.publisher || "",
        b.publicationYear || "", b.publicationCity || "", b.isbn || "",
        b.cobissId || "", b.language || "", b.bookFormat || "",
        b.coverImage || "", b.pdfUrl || "", b.purchaseUrl || "",
        b.weeklyPick ? "da" : ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";");
    });
    const csv = "\uFEFF" + headers + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knjige_export_${booksToExport.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Preuzimanje", description: `CSV sa ${booksToExport.length} knjiga se preuzima...` });
  }

  function downloadNoCoverCsv() {
    const noCoverBooks = (books || []).filter(isMissingCover);
    const headers = "title,author,coverImage";
    const rows = noCoverBooks.map(b => `"${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}",""`);
    const csv = "\uFEFF" + headers + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knjige_bez_korica.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Preuzimanje", description: `CSV sa ${noCoverBooks.length} knjiga bez korica se preuzima...` });
  }

  async function handleCoverCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCoverCsvImporting(true);
    try {
      const formData = new FormData();
      formData.append("csv", file);
      
      const res = await fetch("/api/admin/import/covers", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Import failed");
      }
      
      const data = await res.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      
      let description = `Ažurirano ${data.updated || 0} korica.`;
      if (data.notFound > 0) {
        description += ` Nije pronađeno ${data.notFound} knjiga: ${data.notFoundTitles?.join(", ")}`;
      }
      if (data.errors && data.errors.length > 0) {
        description += ` Greške: ${data.errors.join(", ")}`;
      }
      
      toast({ 
        title: "Import korica završen", 
        description: description,
      });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setCoverCsvImporting(false);
      if (coverCsvInputRef.current) {
        coverCsvInputRef.current.value = "";
      }
    }
  }

  function openCreate() {
    setEditingBook(null);
    setSelectedGenreIds([]);
    form.reset({
      title: "", author: "", description: "", coverImage: "",
      ageGroup: "", genre: "", readingDifficulty: "srednje",
      pageCount: 1, pdfUrl: "", purchaseUrl: "", weeklyPick: false,
    });
    setDialogOpen(true);
  }

  function openEdit(book: BookWithGenres) {
    setEditingBook(book);
    setSelectedGenreIds(book.genres?.map(g => g.id) ?? []);
    form.reset({
      title: book.title,
      author: book.author,
      description: book.description,
      coverImage: book.coverImage,
      ageGroup: book.ageGroup,
      genre: book.genre,
      readingDifficulty: book.readingDifficulty as "lako" | "srednje" | "tesko",
      language: book.language ?? "bosanski",
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
  const ageLabel = (v: string) => AGE_GROUPS.find((a) => a.value === v)?.label ?? v;

  function toggleBookSelection(bookId: string) {
    setSelectedBookIds(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId); else next.add(bookId);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    const pageIds = paginatedBooks.map(b => b.id);
    const allSelected = pageIds.every(id => selectedBookIds.has(id));
    setSelectedBookIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedBookIds);
    if (ids.length === 0) return;
    try {
      await apiRequest("POST", "/api/admin/books/bulk-delete", { bookIds: ids });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: `Obrisano ${ids.length} knjiga` });
      setSelectedBookIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-books-title">Upravljanje knjigama</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-import-menu">
                  <Upload className="mr-2 h-4 w-4" />
                  Uvoz / Izvoz
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Knjige</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleDownloadTemplate} data-testid="button-download-books-template">
                  <Download className="mr-2 h-4 w-4" />
                  Preuzmi CSV šablon
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => csvInputRef.current?.click()} disabled={csvImporting} data-testid="button-import-books-csv">
                  <Upload className="mr-2 h-4 w-4" />
                  {csvImporting ? "Učitavanje..." : "Uvezi knjige (CSV)"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Korice</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => coverCsvInputRef.current?.click()} disabled={coverCsvImporting} data-testid="button-import-covers-csv">
                  <Image className="mr-2 h-4 w-4" />
                  {coverCsvImporting ? "Učitavanje..." : "Uvezi korice (CSV)"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => zipInputRef.current?.click()} disabled={zipUploading} data-testid="button-upload-covers-zip">
                  <FolderArchive className="mr-2 h-4 w-4" />
                  {zipUploading ? "Učitavanje..." : "Uvezi korice (ZIP)"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Alati</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleMigrateCovers} disabled={migrating} data-testid="button-migrate-covers">
                  <RefreshCw className={`mr-2 h-4 w-4 ${migrating ? "animate-spin" : ""}`} />
                  {migrating ? "Pretraga u toku..." : "Pronađi korice (knjiga.ba)"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMigrateExternalToLocal} disabled={migrating} data-testid="button-migrate-external">
                  <Download className="mr-2 h-4 w-4" />
                  Preuzmi eksterne korice na server
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCleanupBooks} disabled={cleaningUp} data-testid="button-cleanup-books">
                  <Trash2 className={`mr-2 h-4 w-4`} />
                  {cleaningUp ? "Čišćenje u toku..." : "Očisti naslove i opise"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open("/api/admin/missing-covers-csv", "_blank")} data-testid="button-download-missing-covers">
                  <ImageOff className="mr-2 h-4 w-4" />
                  Preuzmi listu nedostajućih naslovnica
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={handleCsvImport} data-testid="input-import-books-file" />
            <input type="file" ref={coverCsvInputRef} accept=".csv" className="hidden" onChange={handleCoverCsvImport} data-testid="input-import-covers-file" />
            <input type="file" ref={zipInputRef} accept=".zip" className="hidden" onChange={handleZipUpload} data-testid="input-upload-covers-zip" />
            <Button onClick={openCreate} data-testid="button-add-book">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj knjigu
            </Button>
          </div>
        </div>

        {coverProgress && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3" data-testid="cover-progress">
            <RefreshCw className={`h-4 w-4 text-primary shrink-0 ${migrating ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">{coverProgress}</span>
          </div>
        )}

        {pendingReview.length > 0 && (
          <div className="border rounded-lg overflow-hidden" data-testid="cover-review-panel">
            <div className="bg-yellow-50 dark:bg-yellow-950 border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Slični naslovi pronađeni — {pendingReview.length} čeka odobrenje</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleApproveAll} data-testid="button-approve-all">Odobri sve</Button>
                <Button size="sm" variant="ghost" onClick={handleRejectAll} data-testid="button-reject-all">Odbaci sve</Button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y">
              {pendingReview.map((item) => (
                <div key={item.bookId} className="flex items-center gap-4 p-3 hover:bg-muted/50">
                  <img
                    src={`/api/admin/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                    alt={item.foundTitle}
                    className="w-12 h-16 object-cover rounded border shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Vaša knjiga: <span className="text-primary">{item.bookTitle}</span></p>
                    <p className="text-sm text-muted-foreground truncate">Pronađeno: <span className="font-medium">{item.foundTitle}</span></p>
                    <p className="text-xs text-muted-foreground">Sličnost: {item.similarityScore}% • {item.bookAuthor}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleApprove(item.bookId, item.imageUrl)} data-testid={`button-approve-${item.bookId}`}>Da</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleReject(item.bookId)} data-testid={`button-reject-${item.bookId}`}>Ne</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po naslovu, autoru, žanru ili ISBN-u..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9"
              data-testid="input-search-books"
            />
          </div>
          <Select value={filterGenreId || "all"} onValueChange={(v) => { setFilterGenreId(v === "all" ? "" : v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-genre">
              <SelectValue placeholder="Svi žanrovi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi žanrovi</SelectItem>
              {(allGenres || []).map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filterNoCover ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilterNoCover(!filterNoCover); setCurrentPage(1); }}
            data-testid="button-filter-no-cover"
          >
            <ImageOff className="mr-1.5 h-3.5 w-3.5" />
            Bez korica {noCoverCount > 0 && `(${noCoverCount})`}
          </Button>
          {filterNoCover && noCoverCount > 0 && (
            <Button variant="outline" size="sm" onClick={downloadNoCoverCsv} data-testid="button-download-no-cover-csv">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              CSV
            </Button>
          )}
          <Button
            variant={filterNoQuiz ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilterNoQuiz(!filterNoQuiz); setCurrentPage(1); }}
            data-testid="button-filter-no-quiz"
          >
            <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
            Bez kviza {noQuizCount > 0 && `(${noQuizCount})`}
          </Button>
          {filterNoQuiz && noQuizCount > 0 && (
            <Button variant="outline" size="sm" onClick={downloadNoQuizCsv} data-testid="button-download-no-quiz-csv">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              CSV
            </Button>
          )}
          <Button
            variant={filterNoDescription ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilterNoDescription(!filterNoDescription); setCurrentPage(1); }}
            data-testid="button-filter-no-desc"
          >
            Bez opisa {noDescCount > 0 && `(${noDescCount})`}
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadFilteredBooksCsv} data-testid="button-download-filtered-csv">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Preuzmi CSV ({filteredBooks.length})
            </Button>
          </div>
        </div>

        {selectedBookIds.size > 0 && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3" data-testid="bulk-action-bar">
            <span className="text-sm font-medium">{selectedBookIds.size} knjiga označeno</span>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteConfirm(true)} data-testid="button-bulk-delete">
              <Trash2 className="h-4 w-4 mr-1" /> Obriši označene
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedBookIds(new Set())} data-testid="button-clear-selection">
              Poništi izbor
            </Button>
          </div>
        )}

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
                    <TableHead className="w-10">
                      <Checkbox
                        checked={paginatedBooks.length > 0 && paginatedBooks.every(b => selectedBookIds.has(b.id))}
                        onCheckedChange={toggleSelectAllOnPage}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => toggleSort("title")}
                        data-testid="button-sort-title"
                      >
                        Naslov
                        {sortField === "title" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => toggleSort("author")}
                        data-testid="button-sort-author"
                      >
                        Autor
                        {sortField === "author" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                      </button>
                    </TableHead>
                    <TableHead>Dob</TableHead>
                    <TableHead>Žanr</TableHead>
                    <TableHead>Težina</TableHead>
                    <TableHead className="text-center">Korica</TableHead>
                    <TableHead className="text-center">Kviz</TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => toggleSort("createdAt")}
                        data-testid="button-sort-created"
                      >
                        Dodano
                        {sortField === "createdAt" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                      </button>
                    </TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBooks.length > 0 ? (
                    paginatedBooks.map((book) => (
                      <TableRow key={book.id} data-testid={`row-book-${book.id}`} className={selectedBookIds.has(book.id) ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBookIds.has(book.id)}
                            onCheckedChange={() => toggleBookSelection(book.id)}
                            data-testid={`checkbox-book-${book.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {book.weeklyPick && <Star className="h-4 w-4 text-yellow-500" />}
                            {book.title}
                          </div>
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{ageLabel(book.ageGroup)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {book.genres && book.genres.length > 0
                              ? book.genres.map(g => (
                                  <Badge key={g.id} variant="secondary">{g.name}</Badge>
                                ))
                              : book.genre && <Badge variant="secondary">{book.genre}</Badge>
                            }
                          </div>
                        </TableCell>
                        <TableCell><DifficultyIcon difficulty={book.readingDifficulty} size="sm" /></TableCell>
                        <TableCell className="text-center">
                          {book.coverImage && book.coverImage.trim() && !book.coverImage.includes("placeholder") ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {bookQuizInfo.has(book.id) ? (
                            <span className="text-xs font-medium text-green-600">{bookQuizInfo.get(book.id)}p</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap" data-testid={`text-created-${book.id}`}>
                          {fmtDate(book.createdAt)}
                        </TableCell>
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

        {filteredBooks.length > 0 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground" data-testid="text-books-count">
                Prikazano {(safePage - 1) * booksPerPage + 1}-{Math.min(safePage * booksPerPage, filteredBooks.length)} od {filteredBooks.length} knjiga
              </p>
              <Select value={String(booksPerPage)} onValueChange={(v) => { setBooksPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[90px] h-8 text-xs" data-testid="select-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(n => (
                    <SelectItem key={n} value={String(n)}>{n} po str.</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-4">
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
                    <FormField control={form.control} name="language" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jezik</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "bosanski"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-book-language">
                              <SelectValue placeholder="Odaberite jezik" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bosanski">Bosanski</SelectItem>
                            <SelectItem value="hrvatski">Hrvatski</SelectItem>
                            <SelectItem value="srpski">Srpski</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div>
                    <FormLabel>Žanrovi</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2 p-3 border rounded-md" data-testid="genre-checkboxes">
                      {allGenres && allGenres.length > 0 ? (
                        allGenres.map((g) => (
                          <label key={g.id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <Checkbox
                              checked={selectedGenreIds.includes(g.id)}
                              onCheckedChange={(checked) => {
                                setSelectedGenreIds(prev =>
                                  checked
                                    ? [...prev, g.id]
                                    : prev.filter(id => id !== g.id)
                                );
                              }}
                              data-testid={`checkbox-genre-${g.slug}`}
                            />
                            {g.name}
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-2">Nema žanrova. Dodajte ih na stranici Žanrovi.</p>
                      )}
                    </div>
                  </div>

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

        <AlertDialog open={bulkDeleteConfirm} onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Obriši {selectedBookIds.size} knjiga?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova radnja je nepovratna. Označene knjige ({selectedBookIds.size}) će biti trajno obrisane zajedno sa njihovim kvizovima i rezultatima.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-bulk-delete">Odustani</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDelete} data-testid="button-confirm-bulk-delete">
                Obriši {selectedBookIds.size} knjiga
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
