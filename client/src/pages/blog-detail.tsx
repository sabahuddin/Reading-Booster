import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, User, MessageSquare, Send, Trash2, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogPost, BlogComment } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type CommentWithUser = BlogComment & { userName: string };
type RatingData = { average: number; count: number; userRating: number | null };

function BookRating({
  rating,
  interactive,
  onRate,
  size = "md",
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((val) => {
        const filled = hovered ? val <= hovered : val <= rating;
        return (
          <button
            key={val}
            type="button"
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${interactive ? "hover:scale-110" : ""}`}
            onMouseEnter={() => interactive && setHovered(val)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRate?.(val)}
            data-testid={`button-rate-${val}`}
          >
            <BookOpen
              className={`${sizeClass} transition-colors ${filled ? "text-[#FF861C] fill-[#FF861C]" : "text-muted-foreground/30"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", postId],
    enabled: !!postId,
  });

  const { data: comments } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/blog", postId, "comments"],
    enabled: !!postId,
    queryFn: async () => {
      const res = await fetch(`/api/blog/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      return res.json();
    },
  });

  const { data: ratingData } = useQuery<RatingData>({
    queryKey: ["/api/blog", postId, "rating"],
    enabled: !!postId,
    queryFn: async () => {
      const res = await fetch(`/api/blog/${postId}/rating`);
      if (!res.ok) throw new Error("Failed to load rating");
      return res.json();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/blog/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog", postId, "comments"] });
      setCommentText("");
      toast({ title: "Komentar dodan" });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/blog/${postId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog", postId, "comments"] });
      toast({ title: "Komentar obrisan" });
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      await apiRequest("POST", `/api/blog/${postId}/rating`, { rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog", postId, "rating"] });
      toast({ title: "Ocjena zabilježena" });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <Button variant="ghost" asChild className="mb-8" data-testid="button-back-blog">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Nazad na blog
            </Link>
          </Button>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : !post ? (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold">Objava nije pronađena</h2>
              <p className="mt-2 text-muted-foreground">Žao nam je, tražena objava ne postoji ili je uklonjena.</p>
            </div>
          ) : (
            <>
              <motion.article
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5 }}
                className="prose prose-orange max-w-none dark:prose-invert"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="mb-8 h-[400px] w-full rounded-xl object-cover shadow-lg"
                    data-testid="img-blog-cover"
                  />
                )}

                <header className="mb-8">
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-base text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("hr-HR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl" data-testid="text-blog-title">
                    {post.title}
                  </h1>
                  {post.keywords && post.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 not-prose">
                      {post.keywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}
                </header>

                <div
                  className="whitespace-pre-wrap text-lg leading-relaxed"
                  data-testid="text-blog-content"
                >
                  {post.content}
                </div>
              </motion.article>

              <div className="mt-12 border-t pt-8 not-prose">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ocijenite ovaj tekst</h3>
                    <div className="flex items-center gap-3">
                      <BookRating
                        rating={ratingData?.userRating || 0}
                        interactive={!!user}
                        onRate={(r) => rateMutation.mutate(r)}
                      />
                      {ratingData && ratingData.count > 0 && (
                        <span className="text-sm text-muted-foreground" data-testid="text-rating-info">
                          {ratingData.average.toFixed(1)} / 5 ({ratingData.count}{" "}
                          {ratingData.count === 1 ? "ocjena" : ratingData.count < 5 ? "ocjene" : "ocjena"})
                        </span>
                      )}
                    </div>
                    {!user && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <Link href="/prijava" className="text-[#FF861C] underline">Prijavite se</Link> da biste ocijenili.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Komentari {comments && comments.length > 0 && `(${comments.length})`}
                  </h3>

                  {user ? (
                    <div className="mb-6">
                      <Textarea
                        placeholder="Napišite komentar..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px]"
                        data-testid="input-comment"
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                          onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
                          disabled={!commentText.trim() || commentMutation.isPending}
                          data-testid="button-submit-comment"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {commentMutation.isPending ? "Slanje..." : "Objavi komentar"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Card className="mb-6">
                      <CardContent className="py-4 text-center text-muted-foreground">
                        <Link href="/prijava" className="text-[#FF861C] underline">Prijavite se</Link> da biste ostavili komentar.
                      </CardContent>
                    </Card>
                  )}

                  {!comments || comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Još nema komentara. Budite prvi!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <Card key={comment.id} data-testid={`card-comment-${comment.id}`}>
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-sm">{comment.userName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleDateString("hr-HR", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                              </div>
                              {user && (user.id === comment.userId || user.role === "admin") && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  data-testid={`button-delete-comment-${comment.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
