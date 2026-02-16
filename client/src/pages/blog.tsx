import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

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
              className="text-3xl font-bold sm:text-4xl"
              data-testid="text-blog-title"
            >
              Blog
            </h1>
            <p className="mt-4 text-muted-foreground">
              Savjeti, vijesti i inspiracija za bolje čitanje
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <motion.div
              className="py-20 text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2
                className="mt-4 text-xl font-semibold"
                data-testid="text-blog-empty"
              >
                Još nema objava
              </h2>
              <p className="mt-2 text-muted-foreground">
                Uskoro objavljujemo nove članke. Pratite nas!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
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
                        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
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
                        <h3 className="mb-2 text-lg font-semibold">
                          {post.title}
                        </h3>
                        <p className="flex-1 text-sm text-muted-foreground">
                          {post.excerpt}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {post.author}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
