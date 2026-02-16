import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, PenTool } from "lucide-react";

const blogFormSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  excerpt: z.string().min(1, "Sažetak je obavezan"),
  content: z.string().min(1, "Sadržaj je obavezan"),
  author: z.string().min(1, "Autor je obavezan"),
  coverImage: z.string().min(1, "URL slike je obavezan"),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function AdminBlog() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: { title: "", excerpt: "", content: "", author: "", coverImage: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      await apiRequest("POST", "/api/blog", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Članak dodan", description: "Novi članak je uspješno objavljen." });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      await apiRequest("PUT", `/api/blog/${editingPost!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Članak ažuriran", description: "Promjene su uspješno spremljene." });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Članak obrisan" });
      setDeletePost(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  function openCreate() {
    setEditingPost(null);
    form.reset({ title: "", excerpt: "", content: "", author: "", coverImage: "" });
    setDialogOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);
    form.reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      coverImage: post.coverImage,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingPost(null);
    form.reset();
  }

  function onSubmit(values: BlogFormValues) {
    if (editingPost) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-blog-title">Upravljanje blogom</h1>
          </div>
          <Button onClick={openCreate} data-testid="button-add-blog">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj članak
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naslov</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <TableRow key={post.id} data-testid={`row-blog-${post.id}`}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell>{new Date(post.publishedAt).toLocaleDateString("hr-HR")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(post)} data-testid={`button-edit-blog-${post.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeletePost(post)} data-testid={`button-delete-blog-${post.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nema članaka. Dodajte prvi članak.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Uredi članak" : "Dodaj novi članak"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Izmijenite podatke o članku." : "Unesite podatke za novi članak."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naslov</FormLabel>
                    <FormControl><Input {...field} data-testid="input-blog-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="author" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl><Input {...field} data-testid="input-blog-author" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sažetak</FormLabel>
                    <FormControl><Textarea {...field} data-testid="input-blog-excerpt" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sadržaj</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-[150px]" data-testid="input-blog-content" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="coverImage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL naslovne slike</FormLabel>
                    <FormControl><Input {...field} data-testid="input-blog-coverImage" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={isPending} data-testid="button-submit-blog">
                    {isPending ? "Spremanje..." : editingPost ? "Spremi promjene" : "Dodaj članak"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletePost} onOpenChange={(open) => !open && setDeletePost(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova radnja je nepovratna. Članak "{deletePost?.title}" će biti trajno obrisan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-blog">Odustani</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePost && deleteMutation.mutate(deletePost.id)}
                data-testid="button-confirm-delete-blog"
              >
                {deleteMutation.isPending ? "Brisanje..." : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
