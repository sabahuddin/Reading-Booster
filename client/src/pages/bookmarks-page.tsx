import { Link } from "wouter";
import { Bookmark, BookOpen, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { BookCover } from "@/components/book-cover";
import { AgeGroupBadge } from "@/components/age-group-badge";

export default function BookmarksPage() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
    enabled: isAuthenticated,
  });

  const removeBookmark = useMutation({
    mutationFn: (bookId: string) => apiRequest("DELETE", `/api/bookmarks/${bookId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/bookmarks"] }),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Bookmark className="h-16 w-16 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Prijavite se da vidite omiljene knjige</p>
          <Link href="/prijava">
            <Button>Prijava</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Omiljene knjige</h1>
          {bookmarks.length > 0 && (
            <span className="text-muted-foreground text-sm">({bookmarks.length})</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Bookmark className="h-16 w-16 text-muted-foreground/40" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">Nema omiljenih knjiga</p>
              <p className="text-sm text-muted-foreground mt-1">
                Označite knjige znakom za stranice dok čitate.
              </p>
            </div>
            <Link href="/biblioteka">
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Pregledaj biblioteku
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bookmarks.map((bm: any) => (
              <Card key={bm.id} className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`bookmark-card-${bm.bookId}`}>
                <CardContent className="p-0">
                  <Link href={`/knjiga/${bm.bookId}`}>
                    <div className="relative">
                      <BookCover
                        title={bm.title}
                        coverImage={bm.coverImage}
                        ageGroup={bm.ageGroup}
                        className="w-full"
                      />
                      <div className="absolute top-2 left-2">
                        <AgeGroupBadge ageGroup={bm.ageGroup} size="sm" />
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-semibold line-clamp-2 leading-tight">{bm.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{bm.author}</p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 bg-background/80 hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeBookmark.mutate(bm.bookId)}
                    disabled={removeBookmark.isPending}
                    title="Ukloni iz omiljenih"
                    data-testid={`button-remove-bookmark-${bm.bookId}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
