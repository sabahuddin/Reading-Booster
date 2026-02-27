import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookRatingProps {
  bookId: string;
  isAuthenticated?: boolean;
}

type RatingData = {
  average: number;
  count: number;
  userRating: number | null;
};

export function BookRating({ bookId, isAuthenticated = false }: BookRatingProps) {
  const { toast } = useToast();
  const [hovered, setHovered] = useState(0);

  const { data: ratingData } = useQuery<RatingData>({
    queryKey: ["/api/books", bookId, "rating"],
    enabled: !!bookId,
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", `/api/books/${bookId}/rating`, { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "rating"] });
      toast({ title: "Ocjena zabilježena!" });
    },
    onError: () => {
      toast({ title: "Greška", description: "Prijavite se da biste ocijenili knjigu.", variant: "destructive" });
    },
  });

  const average = ratingData?.average || 0;
  const count = ratingData?.count || 0;
  const userRating = ratingData?.userRating || 0;
  const displayRating = hovered || userRating;

  return (
    <div className="flex items-center gap-3" data-testid="book-rating">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-0.5 transition-colors ${
              isAuthenticated ? "cursor-pointer hover:scale-110" : "cursor-default"
            }`}
            onMouseEnter={() => isAuthenticated && setHovered(star)}
            onClick={() => {
              if (!isAuthenticated) {
                toast({ title: "Prijavite se", description: "Morate biti prijavljeni da biste ocijenili knjigu." });
                return;
              }
              rateMutation.mutate(star);
            }}
            data-testid={`rating-star-${star}`}
          >
            <BookOpen
              className={`h-5 w-5 transition-colors ${
                star <= displayRating
                  ? "text-primary fill-primary"
                  : star <= Math.round(average)
                    ? "text-primary/40"
                    : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground" data-testid="rating-info">
        {count > 0
          ? `${average.toFixed(1)} (${count} ${count === 1 ? "ocjena" : count < 5 ? "ocjene" : "ocjena"})`
          : "Nema ocjena"}
      </span>
    </div>
  );
}
