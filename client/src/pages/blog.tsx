import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Search, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { BlogPost } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function BlogSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
      <CardContent className="p-6">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-3 h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const allKeywords = useMemo(() => {
    if (!posts) return [];
    const kwSet = new Set<string>();
    posts.forEach((p) => {
      if (p.keywords && Array.isArray(p.keywords)) {
        p.keywords.forEach((kw) => kwSet.add(kw));
      }
    });
    return Array.from(kwSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = posts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          (p.keywords && p.keywords.some((kw) => kw.toLowerCase().includes(q)))
      );
    }
    if (selectedKeyword) {
      result = result.filter(
        (p) => p.keywords && p.keywords.includes(selectedKeyword)
      );
    }
    return result;
  }, [posts, searchQuery, selectedKeyword]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="text-4xl font-bold sm:text-5xl"
              data-testid="text-blog-title"
            >
              Blog
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Savjeti, vijesti i inspiracija za bolje čitanje
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pretraži blog..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10"
                data-testid="input-blog-search"
              />
            </div>

            {allKeywords.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant={selectedKeyword === null ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => { setSelectedKeyword(null); setCurrentPage(1); }}
                  data-testid="badge-keyword-all"
                >
                  Sve
                </Badge>
                {allKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant={selectedKeyword === kw ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedKeyword(selectedKeyword === kw ? null : kw);
                      setCurrentPage(1);
                    }}
                    data-testid={`badge-keyword-${kw}`}
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              className="py-20 text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2
                className="mt-4 text-2xl font-semibold"
                data-testid="text-blog-empty"
              >
                {searchQuery || selectedKeyword
                  ? "Nema rezultata pretrage"
                  : "Još nema objava"}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                {searchQuery || selectedKeyword
                  ? "Pokušajte s drugim pojmom ili ključnom riječju."
                  : "Uskoro objavljujemo nove članke. Pratite nas!"}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeIn}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Link href={`/blog/${post.id}`}>
                      <Card
                        className="overflow-visible h-full flex flex-col cursor-pointer transition-shadow hover:shadow-md"
                        data-testid={`card-blog-${post.id}`}
                      >
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-48 w-full rounded-t-xl object-cover"
                          />
                        )}
                        <CardContent className="flex flex-1 flex-col p-6">
                          <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString(
                                "hr-HR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <h3 className="mb-2 text-xl font-semibold">
                            {post.title}
                          </h3>
                          <p className="flex-1 text-base text-muted-foreground">
                            {post.excerpt}
                          </p>
                          {post.keywords &&
                            post.keywords.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {post.keywords.map((kw) => (
                                  <Badge
                                    key={kw}
                                    variant="secondary"
                                    className="text-xs no-default-hover-elevate no-default-active-elevate"
                                  >
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          <p className="mt-3 text-sm text-muted-foreground">
                            {post.author}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-blog-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(p)}
                      data-testid={`button-blog-page-${p}`}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-blog-next-page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
