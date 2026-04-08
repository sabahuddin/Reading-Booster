import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, FileText, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Book, Genre } from "@shared/schema";
import { BookCover } from "@/components/book-cover";
import { AgeGroupBadge } from "@/components/age-group-badge";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type BookWithGenres = Book & { genres?: Genre[] };

export default function Library() {
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const basePath = isReader ? "/citanje" : "/ucenik";
  const dashboardRole = isReader ? "reader" : "student";
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery<BookWithGenres[]>({
    queryKey: ["/api/books"],
  });

  const { data: genres } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });

  const { data: recommended } = useQuery<Book[]>({
    queryKey: ["/api/books/recommended"],
    enabled: isAuthenticated,
  });

  const { data: bookmarks = [] } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
    enabled: isAuthenticated,
  });

  const bookmarkedIds = new Set((bookmarks as any[]).map((bm: any) => bm.bookId));

  const toggleBookmark = useMutation({
    mutationFn: (bookId: string) =>
      bookmarkedIds.has(bookId)
        ? apiRequest("DELETE", `/api/bookmarks/${bookId}`)
        : apiRequest("POST", `/api/bookmarks/${bookId}`),
    onSuccess: (_data, bookId) => {
      qc.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      const wasBookmarked = bookmarkedIds.has(bookId);
      toast({
        title: wasBookmarked ? "Uklonjeno iz oznaka" : "Knjiga označena",
        description: wasBookmarked ? "Knjiga je uklonjena iz tvojih oznaka." : "Knjiga je dodana u tvoje oznake.",
      });
    },
    onError: () => toast({ title: "Greška", description: "Nije moguće označiti knjigu. Pokušaj ponovo.", variant: "destructive" }),
  });

  const filtered = books?.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    }
    if (filterGenre && !(b.genres && b.genres.some(g => g.id === filterGenre))) return false;
    if (filterAge && b.ageGroup !== filterAge) return false;
    return true;
  });

  return (
    <DashboardLayout role={dashboardRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-library-title">Biblioteka</h1>
          <p className="text-muted-foreground">Odaberi knjigu i počni čitati.</p>
        </div>

        {isAuthenticated && recommended && recommended.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold" data-testid="text-recommended-title">Preporučeno za tebe</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {recommended.slice(0, 5).map((book) => (
                <Link key={book.id} href={`${basePath}/knjiga/${book.id}`} data-testid={`link-recommended-${book.id}`}>
                  <Card className="hover-elevate h-full">
                    <CardContent className="p-3 space-y-2">
                      <div className="aspect-[2/3] w-full rounded-md bg-muted flex items-center justify-center overflow-hidden relative">
                        <BookCover title={book.title} author={book.author} ageGroup={book.ageGroup} coverImage={book.coverImage} />
                        <button
                          type="button"
                          data-testid={`button-bookmark-rec-${book.id}`}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark.mutate(book.id); }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                          title={bookmarkedIds.has(book.id) ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
                        >
                          {bookmarkedIds.has(book.id)
                            ? <BookmarkCheck className="h-4 w-4 text-primary" />
                            : <Bookmark className="h-4 w-4" />}
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <AgeGroupBadge ageGroup={book.ageGroup} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <hr className="border-border" />
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pretraži knjige..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-books"
            />
          </div>
          <Select value={filterGenre || "all"} onValueChange={(v) => setFilterGenre(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-genre">
              <SelectValue placeholder="Svi žanrovi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi žanrovi</SelectItem>
              {(genres || []).map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAge || "all"} onValueChange={(v) => setFilterAge(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-age">
              <SelectValue placeholder="Sve dobi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve dobi</SelectItem>
              <SelectItem value="R1">Od 1. razreda</SelectItem>
              <SelectItem value="R4">Od 4. razreda</SelectItem>
              <SelectItem value="R7">Od 7. razreda</SelectItem>
              <SelectItem value="O">Omladina</SelectItem>
              <SelectItem value="A">Odrasli</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-md" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Nema knjiga</p>
            <p className="text-muted-foreground">
              {search ? "Nema rezultata za tvoju pretragu." : "Knjige još nisu dodane."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((book) => (
              <Link key={book.id} href={`${basePath}/knjiga/${book.id}`} data-testid={`link-book-${book.id}`}>
                <Card className="hover-elevate h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-[2/3] w-full rounded-md bg-muted flex items-center justify-center overflow-hidden relative" data-testid={`img-book-cover-${book.id}`}>
                      <BookCover title={book.title} author={book.author} ageGroup={book.ageGroup} coverImage={book.coverImage} />
                      {book.pdfUrl && (
                        <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded" data-testid={`badge-pdf-${book.id}`}>
                          PDF
                        </span>
                      )}
                      <button
                        type="button"
                        data-testid={`button-bookmark-${book.id}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark.mutate(book.id); }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                        title={bookmarkedIds.has(book.id) ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
                      >
                        {bookmarkedIds.has(book.id)
                          ? <BookmarkCheck className="h-4 w-4 text-primary" />
                          : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-2" data-testid={`text-book-title-${book.id}`}>
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <AgeGroupBadge ageGroup={book.ageGroup} />
                      <Badge variant="outline">
                        <FileText className="mr-1" />
                        {book.pageCount} str.
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
