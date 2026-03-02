import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, FileText } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Book, Genre } from "@shared/schema";
import { BookCover } from "@/components/book-cover";

type BookWithGenres = Book & { genres?: Genre[] };

const AGE_LABELS: Record<string, string> = { R1: "Od 1. razreda", R4: "Od 4. razreda", R7: "Od 7. razreda", O: "Omladina", A: "Odrasli" };

export default function Library() {
  const [location] = useLocation();
  const isReader = location.startsWith("/citanje");
  const basePath = isReader ? "/citanje" : "/ucenik";
  const dashboardRole = isReader ? "reader" : "student";
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterAge, setFilterAge] = useState("");

  const { data: books, isLoading } = useQuery<BookWithGenres[]>({
    queryKey: ["/api/books"],
  });

  const { data: genres } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
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
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-2" data-testid={`text-book-title-${book.id}`}>
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{AGE_LABELS[book.ageGroup] || book.ageGroup}</Badge>
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
