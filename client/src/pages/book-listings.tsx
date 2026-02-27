import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  MapPin,
  Phone,
  Gift,
  DollarSign,
  ArrowLeftRight,
  Trash2,
  BookOpen,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import type { BookListing } from "@shared/schema";

type ListingWithUser = BookListing & { userName: string };

const typeLabels: Record<string, { label: string; icon: typeof Gift; color: string }> = {
  poklanjam: { label: "Poklanjam", icon: Gift, color: "bg-green-100 text-green-700 border-green-300" },
  prodajem: { label: "Prodajem", icon: DollarSign, color: "bg-blue-100 text-blue-700 border-blue-300" },
  razmjenjujem: { label: "Razmjenjujem", icon: ArrowLeftRight, color: "bg-purple-100 text-purple-700 border-purple-300" },
};

const listingFormSchema = z.object({
  bookTitle: z.string().min(1, "Naslov je obavezan"),
  bookAuthor: z.string().min(1, "Autor je obavezan"),
  city: z.string().min(1, "Grad je obavezan"),
  listingType: z.enum(["prodajem", "poklanjam", "razmjenjujem"]),
  price: z.string().optional(),
  phone: z.string().min(1, "Kontakt telefon je obavezan"),
  description: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

export default function BookListingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCity, setFilterCity] = useState("");

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      bookTitle: "",
      bookAuthor: "",
      city: "",
      listingType: "poklanjam",
      price: "",
      phone: "",
      description: "",
    },
  });

  const { data: listings, isLoading } = useQuery<ListingWithUser[]>({
    queryKey: ["/api/book-listings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormValues) => {
      const res = await apiRequest("POST", "/api/book-listings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-listings"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Oglas uspješno objavljen!" });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/book-listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-listings"] });
      toast({ title: "Oglas obrisan." });
    },
  });

  const filtered = listings?.filter(l => {
    if (filterType !== "all" && l.listingType !== filterType) return false;
    if (filterCity && !l.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    return true;
  });

  const watchListingType = form.watch("listingType");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-orange-50 to-background dark:from-orange-950/20 dark:to-background py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-listings-title">Prodajem / Poklanjam</h1>
                <p className="text-muted-foreground mt-1">Razmijeni, pokloni ili prodaj knjige drugim čitateljima.</p>
              </div>
              {isAuthenticated ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-listing">
                      <Plus className="h-4 w-4 mr-2" />
                      Novi oglas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novi oglas za knjigu</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="bookTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Naslov knjige</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-book-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bookAuthor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Autor</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-book-author" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grad</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="npr. Sarajevo" data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="listingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tip oglasa</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-listing-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="poklanjam">Poklanjam</SelectItem>
                                  <SelectItem value="prodajem">Prodajem</SelectItem>
                                  <SelectItem value="razmjenjujem">Razmjenjujem</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {watchListingType === "prodajem" && (
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cijena (KM)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="npr. 10 KM" data-testid="input-price" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kontakt telefon</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="npr. 061 123 456" data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opis (opcionalno)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Stanje knjige, napomene..." rows={3} data-testid="input-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={createMutation.isPending}
                          data-testid="button-submit-listing"
                        >
                          {createMutation.isPending ? "Objavljujem..." : "Objavi oglas"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="text-sm text-muted-foreground">Prijavi se da objaviš oglas.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[160px]" data-testid="filter-type">
                    <SelectValue placeholder="Svi tipovi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    <SelectItem value="poklanjam">Poklanjam</SelectItem>
                    <SelectItem value="prodajem">Prodajem</SelectItem>
                    <SelectItem value="razmjenjujem">Razmjenjujem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Filtriraj po gradu..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-[200px]"
                data-testid="filter-city"
              />
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : !filtered || filtered.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">Nema oglasa</p>
                <p className="text-muted-foreground">Budi prvi koji će objaviti oglas za knjigu!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((listing) => {
                  const typeInfo = typeLabels[listing.listingType];
                  const TypeIcon = typeInfo.icon;
                  const isOwner = user?.id === listing.userId;
                  return (
                    <Card key={listing.id} data-testid={`listing-${listing.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight line-clamp-2">{listing.bookTitle}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{listing.bookAuthor}</p>
                          </div>
                          <Badge className={`shrink-0 ${typeInfo.color}`} variant="outline">
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {listing.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {listing.city}
                          </span>
                          {listing.listingType === "prodajem" && listing.price && (
                            <span className="flex items-center gap-1 font-medium text-green-600">
                              <DollarSign className="h-3.5 w-3.5" />
                              {listing.price}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            {listing.userName}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(listing.createdAt).toLocaleDateString("hr-HR")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <a
                            href={`tel:${listing.phone}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                            data-testid={`phone-${listing.id}`}
                          >
                            <Phone className="h-4 w-4" />
                            {listing.phone}
                          </a>
                          {isOwner && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(listing.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`delete-listing-${listing.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
