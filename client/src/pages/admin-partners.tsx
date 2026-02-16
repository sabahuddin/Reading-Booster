import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Partner } from "@shared/schema";
import { Plus, Pencil, Trash2, ExternalLink, MapPin } from "lucide-react";

const partnerSchema = z.object({
  name: z.string().min(2, "Naziv je obavezan"),
  logoUrl: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function AdminPartners() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const { data: partnersList, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/admin/partners"],
  });

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      address: "",
      websiteUrl: "",
      description: "",
      sortOrder: 0,
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      const res = await apiRequest("POST", "/api/partners", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Partner kreiran" });
      setOpen(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PartnerFormValues }) => {
      const res = await apiRequest("PUT", `/api/partners/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Partner ažuriran" });
      setOpen(false);
      setEditingPartner(null);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Partner obrisan" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingPartner(null);
    form.reset({
      name: "",
      logoUrl: "",
      address: "",
      websiteUrl: "",
      description: "",
      sortOrder: 0,
      active: true,
    });
    setOpen(true);
  }

  function openEdit(partner: Partner) {
    setEditingPartner(partner);
    form.reset({
      name: partner.name,
      logoUrl: partner.logoUrl || "",
      address: partner.address || "",
      websiteUrl: partner.websiteUrl || "",
      description: partner.description || "",
      sortOrder: partner.sortOrder,
      active: partner.active,
    });
    setOpen(true);
  }

  function onSubmit(data: PartnerFormValues) {
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
      const result = await res.json();
      if (result.url) {
        form.setValue("logoUrl", result.url);
        toast({ title: "Logo uploadovan" });
      }
    } catch {
      toast({ title: "Greška pri uploadu", variant: "destructive" });
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-partners-title">Partneri</h1>
            <p className="text-muted-foreground">Upravljanje partnerima i sponzorima</p>
          </div>
          <Button onClick={openCreate} data-testid="button-add-partner">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj partnera
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnersList?.map(partner => (
              <Card key={partner.id} className={!partner.active ? "opacity-60" : ""}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="flex items-center gap-3">
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} className="h-12 w-12 rounded object-contain" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-lg font-bold">
                        {partner.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base" data-testid={`text-partner-name-${partner.id}`}>{partner.name}</CardTitle>
                      {partner.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{partner.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(partner)} data-testid={`button-edit-partner-${partner.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(partner.id)} data-testid={`button-delete-partner-${partner.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {partner.description && <p className="text-sm mb-2">{partner.description}</p>}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {partner.websiteUrl && (
                      <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        <ExternalLink className="h-3 w-3" />Web
                      </a>
                    )}
                    <span>Redoslijed: {partner.sortOrder}</span>
                    <span>{partner.active ? "Aktivan" : "Neaktivan"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {partnersList?.length === 0 && (
              <p className="text-muted-foreground col-span-2 text-center py-8">Nema partnera. Dodajte prvog partnera.</p>
            )}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPartner ? "Uredi partnera" : "Dodaj partnera"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naziv</FormLabel>
                    <FormControl><Input placeholder="Naziv partnera" data-testid="input-partner-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={handleLogoUpload} data-testid="input-partner-logo-file" />
                        {field.value && <img src={field.value} alt="Logo preview" className="h-16 rounded" />}
                        <Input placeholder="ili URL loga" data-testid="input-partner-logo-url" {...field} value={field.value ?? ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresa</FormLabel>
                    <FormControl><Input placeholder="Adresa partnera" data-testid="input-partner-address" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Web stranica</FormLabel>
                    <FormControl><Input placeholder="https://..." data-testid="input-partner-website" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl><Textarea placeholder="Kratki opis partnera" data-testid="input-partner-description" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redoslijed prikaza</FormLabel>
                    <FormControl><Input type="number" data-testid="input-partner-sort" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel>Aktivan</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-partner-active" /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-partner">
                  {editingPartner ? "Sačuvaj izmjene" : "Dodaj partnera"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
