import { useState } from "react";
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
import { BookOpen, Search, FileText, Star, TrendingUp, Heart, Sparkles } from "lucide-react";
import type { Book } from "@shared/schema";
import defaultBookCover from "@assets/background_1771243573729.png";

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

const DIFFICULTY_LABELS: Record<string, string> = {
  lako: "Lako",
  srednje: "Srednje",
  tesko: "Teško",
};

function genreLabel(v: string) {
  return GENRES.find((g) => g.value === v)?.label ?? v;
}

function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/knjiga/${book.id}`} data-testid={`link-book-${book.id}`}>
      <Card className="hover-elevate h-full">
        <CardContent className="p-4 space-y-3">
          <div className="aspect-[2/3] w-full rounded-md bg-muted flex items-center justify-center overflow-hidden">
            <img
              src={book.coverImage || defaultBookCover}
              alt={book.title}
              className="h-full w-full object-cover rounded-md"
              data-testid={`img-book-cover-${book.id}`}
            />
          </div>
          <div>
            <h3 className="font-semibold line-clamp-2" data-testid={`text-book-title-${book.id}`}>
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{book.ageGroup}</Badge>
            <Badge variant="outline">{genreLabel(book.genre)}</Badge>
            <Badge variant="outline" className="text-xs">
              {DIFFICULTY_LABELS[book.readingDifficulty] ?? book.readingDifficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PublicLibrary() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const weeklyPick = books?.find((b) => b.weeklyPick);
  const mostRead = books ? [...books].sort((a, b) => b.timesRead - a.timesRead).find((b) => b.timesRead > 0) : null;

  const genresWithBooks = books
    ? Array.from(new Set(books.map((b) => b.genre))).filter((g) => g !== "ostalo").slice(0, 3)
    : [];
  const recommendedByGenre = genresWithBooks.map((genre) => ({
    genre,
    label: genreLabel(genre),
    books: books!.filter((b) => b.genre === genre).sort((a, b) => b.timesRead - a.timesRead).slice(0, 4),
  }));

  const filtered = books?.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "all" || b.genre === selectedGenre;
    const matchAge = selectedAge === "all" || b.ageGroup === selectedAge;
    const matchDifficulty = selectedDifficulty === "all" || b.readingDifficulty === selectedDifficulty;
    return matchSearch && matchGenre && matchAge && matchDifficulty;
  });

  const hasActiveFilters = search || selectedGenre !== "all" || selectedAge !== "all" || selectedDifficulty !== "all";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-library-title">Biblioteka</h1>
            <p className="text-muted-foreground">Pregledaj knjige i testiraj svoje znanje.</p>
          </div>

          {!hasActiveFilters && !isLoading && books && books.length > 0 && (
            <div className="space-y-8">
              {(weeklyPick || mostRead) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {weeklyPick && (
                    <Card className="border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20" data-testid="card-weekly-pick">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Prijedlog sedmice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/knjiga/${weeklyPick.id}`}>
                          <div className="flex gap-4 items-start cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-20 aspect-[2/3] shrink-0 rounded-md overflow-hidden bg-muted">
                              <img src={weeklyPick.coverImage || defaultBookCover} alt={weeklyPick.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg">{weeklyPick.title}</h3>
                              <p className="text-sm text-muted-foreground">{weeklyPick.author}</p>
                              <p className="text-sm line-clamp-2">{weeklyPick.description}</p>
                              <div className="flex gap-2 pt-1">
                                <Badge variant="secondary">{weeklyPick.ageGroup}</Badge>
                                <Badge variant="outline">{genreLabel(weeklyPick.genre)}</Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {mostRead && (
                    <Card className="border-2 border-primary/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20" data-testid="card-most-read">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Najčitanija knjiga
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/knjiga/${mostRead.id}`}>
                          <div className="flex gap-4 items-start cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-20 aspect-[2/3] shrink-0 rounded-md overflow-hidden bg-muted">
                              <img src={mostRead.coverImage || defaultBookCover} alt={mostRead.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg">{mostRead.title}</h3>
                              <p className="text-sm text-muted-foreground">{mostRead.author}</p>
                              <p className="text-sm line-clamp-2">{mostRead.description}</p>
                              <div className="flex gap-2 pt-1">
                                <Badge variant="secondary">{mostRead.ageGroup}</Badge>
                                <Badge variant="outline">{mostRead.timesRead}x pročitano</Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {recommendedByGenre.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-400" />
                    Čitatelji preporučuju
                  </h2>
                  {recommendedByGenre.map(({ genre, label, books: genreBooks }) => (
                    <div key={genre} className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
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
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Sve knjige</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pretraži knjige..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-books"
                />
              </div>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-genre">
                  <SelectValue placeholder="Žanr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi žanrovi</SelectItem>
                  {GENRES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAge} onValueChange={setSelectedAge}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-age">
                  <SelectValue placeholder="Dob" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve dobi</SelectItem>
                  {AGE_GROUPS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-difficulty">
                  <SelectValue placeholder="Težina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve težine</SelectItem>
                  <SelectItem value="lako">Lako</SelectItem>
                  <SelectItem value="srednje">Srednje</SelectItem>
                  <SelectItem value="tesko">Teško</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  }}
                  data-testid="button-clear-filters"
                >
                  Ukloni filtere
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
