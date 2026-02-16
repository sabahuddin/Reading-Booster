import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, FileText } from "lucide-react";
import type { Book } from "@shared/schema";

export default function PublicLibrary() {
  const [search, setSearch] = useState("");

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const filtered = books?.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-library-title">Biblioteka</h1>
            <p className="text-muted-foreground">Pregledaj knjige i testiraj svoje znanje.</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pretraži knjige..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-books"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-40 w-full rounded-md" />
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
                <Link key={book.id} href={`/knjiga/${book.id}`} data-testid={`link-book-${book.id}`}>
                  <Card className="hover-elevate h-full">
                    <CardContent className="p-4 space-y-3">
                      {book.coverImage ? (
                        <div className="h-40 w-full rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover rounded-md"
                            data-testid={`img-book-cover-${book.id}`}
                          />
                        </div>
                      ) : (
                        <div className="h-40 w-full rounded-md bg-muted flex items-center justify-center">
                          <BookOpen className="text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold line-clamp-2" data-testid={`text-book-title-${book.id}`}>
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{book.gradeLevel}</Badge>
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
      </main>
      <Footer />
    </div>
  );
}
