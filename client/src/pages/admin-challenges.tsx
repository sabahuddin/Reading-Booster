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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Challenge } from "@shared/schema";
import { Plus, Pencil, Trash2, Trophy, Calendar } from "lucide-react";

const challengeSchema = z.object({
  title: z.string().min(2, "Naslov je obavezan"),
  description: z.string().min(10, "Opis je obavezan"),
  prizes: z.string().min(5, "Nagrade su obavezne"),
  startDate: z.string().min(1, "Datum početka je obavezan"),
  endDate: z.string().min(1, "Datum završetka je obavezan"),
  active: z.boolean().default(true),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

export default function AdminChallenges() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  const { data: challengesList, isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/admin/challenges"],
  });

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      prizes: "",
      startDate: "",
      endDate: "",
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ChallengeFormValues) => {
      const payload = { ...data, startDate: new Date(data.startDate).toISOString(), endDate: new Date(data.endDate).toISOString() };
      const res = await apiRequest("POST", "/api/challenges", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Izazov kreiran" });
      setOpen(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ChallengeFormValues }) => {
      const payload = { ...data, startDate: new Date(data.startDate).toISOString(), endDate: new Date(data.endDate).toISOString() };
      const res = await apiRequest("PUT", `/api/challenges/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Izazov ažuriran" });
      setOpen(false);
      setEditingChallenge(null);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/challenges/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Izazov obrisan" });
    },
    onError: (err: any) => toast({ title: "Greška", description: err.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingChallenge(null);
    form.reset({ title: "", description: "", prizes: "", startDate: "", endDate: "", active: true });
    setOpen(true);
  }

  function openEdit(challenge: Challenge) {
    setEditingChallenge(challenge);
    form.reset({
      title: challenge.title,
      description: challenge.description,
      prizes: challenge.prizes,
      startDate: new Date(challenge.startDate).toISOString().split("T")[0],
      endDate: new Date(challenge.endDate).toISOString().split("T")[0],
      active: challenge.active,
    });
    setOpen(true);
  }

  function onSubmit(data: ChallengeFormValues) {
    if (editingChallenge) {
      updateMutation.mutate({ id: editingChallenge.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("bs-BA", { day: "numeric", month: "long", year: "numeric" });
  }

  function isActive(challenge: Challenge) {
    const now = new Date();
    return challenge.active && new Date(challenge.startDate) <= now && new Date(challenge.endDate) >= now;
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-challenges-title">Izazovi</h1>
            <p className="text-muted-foreground">Upravljanje izazovima čitanja i nagradama</p>
          </div>
          <Button onClick={openCreate} data-testid="button-add-challenge">
            <Plus className="mr-2 h-4 w-4" />
            Novi izazov
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-40" />)}</div>
        ) : (
          <div className="space-y-4">
            {challengesList?.map(challenge => (
              <Card key={challenge.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <CardTitle className="text-lg" data-testid={`text-challenge-title-${challenge.id}`}>{challenge.title}</CardTitle>
                      {isActive(challenge) ? (
                        <Badge variant="default">Aktivan</Badge>
                      ) : challenge.active ? (
                        <Badge variant="secondary">Zakazan</Badge>
                      ) : (
                        <Badge variant="outline">Neaktivan</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(challenge)} data-testid={`button-edit-challenge-${challenge.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(challenge.id)} data-testid={`button-delete-challenge-${challenge.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{challenge.description}</p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Nagrade:</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{challenge.prizes.split("|").map((p, i) => <span key={i} className="block">{p.trim()}</span>)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {challengesList?.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nema izazova. Kreirajte prvi izazov.</p>
            )}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChallenge ? "Uredi izazov" : "Novi izazov"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naslov</FormLabel>
                    <FormControl><Input placeholder="Naziv izazova" data-testid="input-challenge-title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl><Textarea placeholder="Opis izazova" data-testid="input-challenge-description" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="prizes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nagrade (odvojene znakom |)</FormLabel>
                    <FormControl><Textarea placeholder="1. mjesto: ... | 2. mjesto: ..." data-testid="input-challenge-prizes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum početka</FormLabel>
                      <FormControl><Input type="date" data-testid="input-challenge-start" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum završetka</FormLabel>
                      <FormControl><Input type="date" data-testid="input-challenge-end" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel>Aktivan</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-challenge-active" /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-challenge">
                  {editingChallenge ? "Sačuvaj izmjene" : "Kreiraj izazov"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
