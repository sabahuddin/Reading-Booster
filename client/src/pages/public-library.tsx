import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, Star, TrendingUp, Heart, Sparkles, ChevronLeft, ChevronRight, Library } from "lucide-react";
import type { Book, Genre } from "@shared/schema";
import { BookCover } from "@/components/book-cover";

type BookWithGenres = Book & { genres?: Genre[] };

const AGE_GROUPS = [
  { value: "R1", label: "Od 1. razreda" },
  { value: "R4", label: "Od 4. razreda" },
  { value: "R7", label: "Od 7. razreda" },
  { value: "O", label: "Omladina" },
  { value: "A", label: "Odrasli" },
];

const AGE_LABELS: Record<string, string> = { R1: "Od 1. razreda", R4: "Od 4. razreda", R7: "Od 7. razreda", O: "Omladina", A: "Odrasli" };

function BookCard({ book }: { book: BookWithGenres }) {
  return (
    <Link href={`/knjiga/${book.id}`} data-testid={`link-book-${book.id}`}>
      <Card className="hover-elevate h-full">
        <CardContent className="p-3 space-y-2">
          <div className="aspect-[2/3] w-full rounded-md bg-muted flex items-center justify-center overflow-hidden relative" data-testid={`img-book-cover-${book.id}`}>
            <BookCover title={book.title} author={book.author} ageGroup={book.ageGroup} coverImage={book.coverImage} />
            {book.pdfUrl && (
              <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded" data-testid={`badge-pdf-${book.id}`}>
                PDF
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight" data-testid={`text-book-title-${book.id}`}>
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-xs">{AGE_LABELS[book.ageGroup] || book.ageGroup}</Badge>
            {book.genres && book.genres.length > 0
              ? book.genres.slice(0, 2).map(g => <Badge key={g.id} variant="outline" className="text-xs">{g.name}</Badge>)
              : book.genre && <Badge variant="outline" className="text-xs">{book.genre}</Badge>
            }
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const BOOKS_PER_PAGE = 20;

type TabType = "biblioteka" | "preporuke" | "prijedlog";

export default function PublicLibrary() {
  const [activeTab, setActiveTab] = useState<TabType>("biblioteka");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: books, isLoading } = useQuery<BookWithGenres[]>({
    queryKey: ["/api/books"],
  });

  const { data: allGenres } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });

  const genreCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (books && allGenres) {
      for (const g of allGenres) {
        map.set(g.id, books.filter(b => b.genres?.some(bg => bg.id === g.id)).length);
      }
    }
    return map;
  }, [books, allGenres]);

  const weeklyPicks = useMemo(() => {
    if (!books) return [];
    return books.filter(b => b.weeklyPick);
  }, [books]);

  const mostRead = books ? [...books].sort((a, b) => b.timesRead - a.timesRead).find((b) => b.timesRead > 0) : null;

  const recommendedByGenre = useMemo(() => {
    if (!books || !allGenres) return [];
    return allGenres.map((genre) => ({
      genre: genre.slug,
      label: genre.name,
      books: books.filter((b) => b.genres?.some(g => g.id === genre.id)).sort((a, b) => b.timesRead - a.timesRead).slice(0, 8),
    })).filter(r => r.books.length > 0);
  }, [books, allGenres]);

  const filtered = useMemo(() => {
    return books?.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchGenre = selectedGenre === "all" || (b.genres?.some(g => g.slug === selectedGenre)) || b.genre === selectedGenre;
      const matchAge = selectedAge === "all" || b.ageGroup === selectedAge;
      const matchDifficulty = selectedDifficulty === "all" || b.readingDifficulty === selectedDifficulty;
      const matchLanguage = selectedLanguage === "all" || (b.language || "bosanski") === selectedLanguage;
      return matchSearch && matchGenre && matchAge && matchDifficulty && matchLanguage;
    });
  }, [books, search, selectedGenre, selectedAge, selectedDifficulty, selectedLanguage]);

  const totalPages = filtered ? Math.ceil(filtered.length / BOOKS_PER_PAGE) : 0;
  const paginatedBooks = filtered?.slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE);

  function handleFilterChange() {
    setCurrentPage(1);
  }

  const hasActiveFilters = search || selectedGenre !== "all" || selectedAge !== "all" || selectedDifficulty !== "all" || selectedLanguage !== "all";

  const tabs: { key: TabType; label: string; icon: typeof Library }[] = [
    { key: "biblioteka", label: "Biblioteka", icon: Library },
    { key: "preporuke", label: "Čitaoci preporučuju", icon: Heart },
    { key: "prijedlog", label: "Prijedlog sedmice", icon: Star },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold" data-testid="text-library-title">Biblioteka</h1>
            <p className="text-lg text-muted-foreground">Pregledaj knjige i testiraj svoje znanje.</p>
          </div>

          <div className="flex gap-1 border-b" data-testid="tabs-library">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
                data-testid={`tab-${key}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === "biblioteka" && (
            <div className="flex gap-6">
              <aside className="hidden lg:block w-52 shrink-0" data-testid="sidebar-genres">
                <div className="sticky top-4 space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Žanrovi</h3>
                  <nav className="space-y-0.5">
                    <button
                      onClick={() => { setSelectedGenre("all"); handleFilterChange(); }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                        selectedGenre === "all"
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                      data-testid="sidebar-genre-all"
                    >
                      Sve knjige
                    </button>
                    {allGenres?.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => { setSelectedGenre(g.slug); handleFilterChange(); }}
                          aria-pressed={selectedGenre === g.slug}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between ${
                            selectedGenre === g.slug
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-foreground"
                          }`}
                          data-testid={`sidebar-genre-${g.slug}`}
                        >
                          <span>{g.name}</span>
                          <span className={`text-xs ${selectedGenre === g.slug ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{genreCounts.get(g.id) || 0}</span>
                        </button>
                    ))}
                  </nav>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Dob</h3>
                    <nav className="space-y-0.5">
                      <button
                        onClick={() => { setSelectedAge("all"); handleFilterChange(); }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          selectedAge === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted text-foreground"
                        }`}
                        data-testid="sidebar-age-all"
                      >
                        Sve dobi
                      </button>
                      {AGE_GROUPS.map((a) => (
                        <button
                          key={a.value}
                          onClick={() => { setSelectedAge(a.value); handleFilterChange(); }}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            selectedAge === a.value
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-foreground"
                          }`}
                          data-testid={`sidebar-age-${a.value}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Težina</h3>
                    <nav className="space-y-0.5">
                      <button
                        onClick={() => { setSelectedDifficulty("all"); handleFilterChange(); }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          selectedDifficulty === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted text-foreground"
                        }`}
                        data-testid="sidebar-difficulty-all"
                      >
                        Sve težine
                      </button>
                      {[{ v: "lako", l: "Lako" }, { v: "srednje", l: "Srednje" }, { v: "tesko", l: "Teško" }].map((d) => (
                        <button
                          key={d.v}
                          onClick={() => { setSelectedDifficulty(d.v); handleFilterChange(); }}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            selectedDifficulty === d.v
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-foreground"
                          }`}
                          data-testid={`sidebar-difficulty-${d.v}`}
                        >
                          {d.l}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Jezik</h3>
                    <nav className="space-y-0.5">
                      <button
                        onClick={() => { setSelectedLanguage("all"); handleFilterChange(); }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          selectedLanguage === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted text-foreground"
                        }`}
                        data-testid="sidebar-language-all"
                      >
                        Svi jezici
                      </button>
                      {[{ v: "bosanski", l: "Bosanski" }, { v: "hrvatski", l: "Hrvatski" }, { v: "srpski", l: "Srpski" }].map((lang) => (
                        <button
                          key={lang.v}
                          onClick={() => { setSelectedLanguage(lang.v); handleFilterChange(); }}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            selectedLanguage === lang.v
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-foreground"
                          }`}
                          data-testid={`sidebar-language-${lang.v}`}
                        >
                          {lang.l}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSearch("");
                        setSelectedGenre("all");
                        setSelectedAge("all");
                        setSelectedDifficulty("all");
                        setSelectedLanguage("all");
                      }}
                      data-testid="button-clear-filters-sidebar"
                    >
                      Ukloni filtere
                    </Button>
                  )}
                </div>
              </aside>

              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Pretraži knjige..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                      className="pl-10"
                      data-testid="input-search-books"
                    />
                  </div>
                  <div className="flex gap-2 lg:hidden">
                    <Select value={selectedGenre} onValueChange={(v) => { setSelectedGenre(v); handleFilterChange(); }}>
                      <SelectTrigger className="w-[140px]" data-testid="select-filter-genre">
                        <SelectValue placeholder="Žanr" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Svi žanrovi</SelectItem>
                        {allGenres?.map((g) => (
                          <SelectItem key={g.id} value={g.slug}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedAge} onValueChange={(v) => { setSelectedAge(v); handleFilterChange(); }}>
                      <SelectTrigger className="w-[140px]" data-testid="select-filter-age">
                        <SelectValue placeholder="Dob" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Sve dobi</SelectItem>
                        {AGE_GROUPS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedDifficulty} onValueChange={(v) => { setSelectedDifficulty(v); handleFilterChange(); }}>
                      <SelectTrigger className="w-[140px]" data-testid="select-filter-difficulty">
                        <SelectValue placeholder="Težina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Sve težine</SelectItem>
                        <SelectItem value="lako">Lako</SelectItem>
                        <SelectItem value="srednje">Srednje</SelectItem>
                        <SelectItem value="tesko">Teško</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedLanguage} onValueChange={(v) => { setSelectedLanguage(v); handleFilterChange(); }}>
                      <SelectTrigger className="w-[140px]" data-testid="select-filter-language">
                        <SelectValue placeholder="Jezik" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Svi jezici</SelectItem>
                        <SelectItem value="bosanski">Bosanski</SelectItem>
                        <SelectItem value="hrvatski">Hrvatski</SelectItem>
                        <SelectItem value="srpski">Srpski</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <span className="text-sm text-muted-foreground self-center">
                      {filtered?.length ?? 0} knjiga
                    </span>
                  )}
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-3 space-y-2">
                          <Skeleton className="aspect-[2/3] w-full rounded-md" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : !filtered || filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-xl font-medium">Nema knjiga</p>
                    <p className="text-muted-foreground">
                      {hasActiveFilters ? "Nema rezultata za tvoju pretragu." : "Knjige još nisu dodane."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearch("");
                          setSelectedGenre("all");
                          setSelectedAge("all");
                          setSelectedDifficulty("all");
                          setSelectedLanguage("all");
                        }}
                        data-testid="button-clear-filters"
                      >
                        Ukloni filtere
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedBooks?.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-8">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          data-testid="button-prev-page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                          .reduce<(number | string)[]>((acc, p, i, arr) => {
                            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) =>
                            typeof p === "string" ? (
                              <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">...</span>
                            ) : (
                              <Button
                                key={p}
                                variant={currentPage === p ? "default" : "outline"}
                                size="icon"
                                onClick={() => setCurrentPage(p)}
                                data-testid={`button-page-${p}`}
                              >
                                {p}
                              </Button>
                            )
                          )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          data-testid="button-next-page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {filtered?.length} knjiga
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "preporuke" && (
            <>
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-7 w-40" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((j) => (
                          <Card key={j}>
                            <CardContent className="p-4 space-y-3">
                              <Skeleton className="aspect-[2/3] w-full rounded-md" />
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendedByGenre.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-xl font-medium">Još nema preporuka</p>
                  <p className="text-muted-foreground">Čitaoci još nisu dovoljno čitali da bi se pojavile preporuke.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {mostRead && (
                    <Card className="border-2 border-primary/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20" data-testid="card-most-read">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Najčitanija knjiga
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/knjiga/${mostRead.id}`}>
                          <div className="flex gap-4 items-start cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-20 aspect-[2/3] shrink-0 rounded-md overflow-hidden bg-muted">
                              <BookCover title={mostRead.title} author={mostRead.author} ageGroup={mostRead.ageGroup} coverImage={mostRead.coverImage} />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-xl">{mostRead.title}</h3>
                              <p className="text-base text-muted-foreground">{mostRead.author}</p>
                              <p className="text-base line-clamp-2">{mostRead.description}</p>
                              <div className="flex gap-2 pt-1">
                                <Badge variant="secondary">{AGE_LABELS[mostRead.ageGroup] || mostRead.ageGroup}</Badge>
                                <Badge variant="outline">{mostRead.timesRead}x pročitano</Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {recommendedByGenre.map(({ genre, label, books: genreBooks }) => (
                    <div key={genre} className="space-y-3">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        {label}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {genreBooks.map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "prijedlog" && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="aspect-[2/3] w-full rounded-md" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : weeklyPicks.length === 0 ? (
                <div className="text-center py-16">
                  <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-xl font-medium">Nema prijedloga za ovu sedmicu</p>
                  <p className="text-muted-foreground">Uskoro ćemo dodati nove preporuke.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {weeklyPicks.map((pick) => (
                    <Card key={pick.id} className="border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20" data-testid={`card-weekly-pick-${pick.id}`}>
                      <CardContent className="p-6">
                        <Link href={`/knjiga/${pick.id}`}>
                          <div className="flex gap-6 items-start cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-28 aspect-[2/3] shrink-0 rounded-md overflow-hidden bg-muted">
                              <BookCover title={pick.title} author={pick.author} ageGroup={pick.ageGroup} coverImage={pick.coverImage} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Prijedlog sedmice</span>
                              </div>
                              <h3 className="font-bold text-xl">{pick.title}</h3>
                              <p className="text-base text-muted-foreground">{pick.author}</p>
                              <p className="text-base line-clamp-3">{pick.description}</p>
                              <div className="flex gap-2 pt-1 flex-wrap">
                                <Badge variant="secondary">{AGE_LABELS[pick.ageGroup] || pick.ageGroup}</Badge>
                                {(pick as BookWithGenres).genres && (pick as BookWithGenres).genres!.length > 0
                                  ? (pick as BookWithGenres).genres!.map(g => <Badge key={g.id} variant="outline">{g.name}</Badge>)
                                  : pick.genre && <Badge variant="outline">{pick.genre}</Badge>
                                }
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
