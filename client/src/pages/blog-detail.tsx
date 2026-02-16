import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { BlogPost } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", postId],
    enabled: !!postId,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <Button variant="ghost" asChild className="mb-8" data-testid="button-back-blog">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
              <h2 className="text-2xl font-bold">Objava nije pronađena</h2>
              <p className="mt-2 text-muted-foreground">Žao nam je, tražena objava ne postoji ili je uklonjena.</p>
            </div>
          ) : (
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
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl" data-testid="text-blog-title">
                  {post.title}
                </h1>
              </header>

              <div 
                className="whitespace-pre-wrap text-lg leading-relaxed" 
                data-testid="text-blog-content"
              >
                {post.content}
              </div>
            </motion.article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
