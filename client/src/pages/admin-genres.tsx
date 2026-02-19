import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Genre } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, Tags, GripVertical } from "lucide-react";

const genreFormSchema = z.object({
  name: z.string().min(1, "Naziv žanra je obavezan"),
  slug: z.string().min(1, "Slug je obavezan").regex(/^[a-z0-9_]+$/, "Slug može sadržavati samo mala slova, brojeve i donju crtu"),
  sortOrder: z.coerce.number().min(0, "Redoslijed mora biti pozitivan broj"),
});

type GenreFormValues = z.infer<typeof genreFormSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function AdminGenres() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: genresList, isLoading } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });

  const form = useForm<GenreFormValues>({
    resolver: zodResolver(genreFormSchema),
    defaultValues: { name: "", slug: "", sortOrder: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GenreFormValues) => {
      const res = await apiRequest("POST", "/api/genres", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/genres"] });
      toast({ title: "Žanr kreiran", description: "Novi žanr je uspješno dodan." });
      setDialogOpen(false);
      form.reset({ name: "", slug: "", sortOrder: 0 });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GenreFormValues }) => {
      const res = await apiRequest("PUT", `/api/genres/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/genres"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Žanr ažuriran", description: "Žanr je uspješno ažuriran." });
      setDialogOpen(false);
      setEditingGenre(null);
      form.reset({ name: "", slug: "", sortOrder: 0 });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/genres/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/genres"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Žanr obrisan", description: "Žanr je uspješno obrisan." });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const openCreate = () => {
    setEditingGenre(null);
    const nextOrder = genresList ? Math.max(0, ...genresList.map(g => g.sortOrder)) + 1 : 0;
    form.reset({ name: "", slug: "", sortOrder: nextOrder });
    setDialogOpen(true);
  };

  const openEdit = (genre: Genre) => {
    setEditingGenre(genre);
    form.reset({ name: genre.name, slug: genre.slug, sortOrder: genre.sortOrder });
    setDialogOpen(true);
  };

  const onSubmit = (values: GenreFormValues) => {
    if (editingGenre) {
      updateMutation.mutate({ id: editingGenre.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const nameValue = form.watch("name");

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Upravljanje žanrovima</h1>
            <p className="text-muted-foreground">Dodajte, uredite ili obrišite žanrove knjiga</p>
          </div>
          <Button onClick={openCreate} data-testid="button-add-genre">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj žanr
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !genresList || genresList.length === 0 ? (
              <div className="p-12 text-center">
                <Tags className="mx-auto mb-4 text-muted-foreground h-12 w-12" />
                <p className="text-lg font-medium">Nema žanrova</p>
                <p className="text-muted-foreground">Dodajte prvi žanr klikom na dugme iznad.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Red.</TableHead>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {genresList.map((genre) => (
                    <TableRow key={genre.id} data-testid={`row-genre-${genre.id}`}>
                      <TableCell className="text-muted-foreground">{genre.sortOrder}</TableCell>
                      <TableCell className="font-medium" data-testid={`text-genre-name-${genre.id}`}>{genre.name}</TableCell>
                      <TableCell className="text-muted-foreground">{genre.slug}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(genre)}
                            data-testid={`button-edit-genre-${genre.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(genre.id)}
                            data-testid={`button-delete-genre-${genre.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGenre ? "Uredi žanr" : "Dodaj novi žanr"}</DialogTitle>
            <DialogDescription>
              {editingGenre ? "Ažurirajte podatke o žanru." : "Unesite podatke za novi žanr."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Naziv žanra</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="npr. Avantura i Fantasy"
                      data-testid="input-genre-name"
                      onChange={(e) => {
                        field.onChange(e);
                        if (!editingGenre) {
                          form.setValue("slug", slugify(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (interni identifikator)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="npr. avantura_fantasy" data-testid="input-genre-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sortOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Redoslijed prikaza</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} data-testid="input-genre-sort" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-genre">
                  {editingGenre ? "Sačuvaj" : "Dodaj"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati žanr?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će obrisati žanr i ukloniti ga sa svih knjiga kojima je dodijeljen. Ovo se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete-genre"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
