import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";

type UserWithoutPassword = Omit<User, "password">;

const editUserSchema = z.object({
  fullName: z.string().min(1, "Ime je obavezno"),
  email: z.string().email("Neispravan email"),
  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: "Lozinka mora imati barem 6 znakova",
  }),
  role: z.enum(["student", "teacher", "parent", "admin"]),
  schoolName: z.string().optional(),
  className: z.string().optional(),
  parentId: z.string().optional(),
});

const createUserSchema = z.object({
  username: z.string().min(3, "Korisničko ime mora imati barem 3 znaka"),
  password: z.string().min(6, "Lozinka mora imati barem 6 znakova"),
  fullName: z.string().min(1, "Ime je obavezno"),
  email: z.string().email("Neispravan email"),
  role: z.enum(["student", "teacher", "parent", "admin"]),
  schoolName: z.string().optional(),
  className: z.string().optional(),
  parentId: z.string().optional(),
});

type EditUserValues = z.infer<typeof editUserSchema>;
type CreateUserValues = z.infer<typeof createUserSchema>;

const roleLabels: Record<string, string> = {
  student: "Učenik",
  teacher: "Učitelj",
  parent: "Roditelj",
  admin: "Administrator",
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithoutPassword | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users, isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchesSearch = searchQuery === "" ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const editForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "student", schoolName: "", className: "", parentId: "" },
  });

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: "", password: "", fullName: "", email: "", role: "student", schoolName: "", className: "", parentId: "" },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditUserValues) => {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.password) delete payload.password;
      if (!payload.schoolName) delete payload.schoolName;
      if (!payload.className) delete payload.className;
      if (!payload.parentId) delete payload.parentId;
      await apiRequest("PUT", `/api/admin/users/${editingUser!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Korisnik ažuriran", description: "Promjene su uspješno spremljene." });
      setEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserValues) => {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.schoolName) delete payload.schoolName;
      if (!payload.className) delete payload.className;
      if (!payload.parentId) delete payload.parentId;
      await apiRequest("POST", "/api/auth/register", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Korisnik kreiran", description: "Novi korisnik je uspješno kreiran." });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Korisnik obrisan" });
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  function openEdit(user: UserWithoutPassword) {
    setEditingUser(user);
    editForm.reset({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role as "student" | "teacher" | "parent" | "admin",
      schoolName: user.schoolName ?? "",
      className: user.className ?? "",
      parentId: user.parentId ?? "",
    });
    setEditDialogOpen(true);
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-users-title">Upravljanje korisnicima</h1>
          </div>
          <Button onClick={() => { createForm.reset(); setCreateDialogOpen(true); }} data-testid="button-add-user">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj korisnika
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po imenu ili korisničkom imenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-role-filter">
              <SelectValue placeholder="Filtriraj po ulozi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve uloge</SelectItem>
              <SelectItem value="student">Učenik</SelectItem>
              <SelectItem value="teacher">Učitelj</SelectItem>
              <SelectItem value="parent">Roditelj</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
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
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Škola</TableHead>
                    <TableHead>Razred</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{roleLabels[user.role] ?? user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.schoolName ?? "-"}</TableCell>
                        <TableCell>{user.className ?? "-"}</TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(user)} data-testid={`button-edit-user-${user.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteUser(user)} data-testid={`button-delete-user-${user.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {searchQuery || roleFilter !== "all" ? "Nema rezultata za zadani filter." : "Nema korisnika."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Uredi korisnika</DialogTitle>
              <DialogDescription>Izmijenite podatke o korisniku.</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
                <FormField control={editForm.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ime i prezime</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-fullName" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova lozinka</FormLabel>
                    <FormControl><Input type="password" placeholder="Ostavite prazno ako ne želite mijenjati" {...field} data-testid="input-edit-password" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uloga</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Učenik</SelectItem>
                        <SelectItem value="teacher">Učitelj</SelectItem>
                        <SelectItem value="parent">Roditelj</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="schoolName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Škola</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-schoolName" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="className" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razred</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-className" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="parentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID roditelja</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-parentId" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit-user">
                    {updateMutation.isPending ? "Spremanje..." : "Spremi promjene"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dodaj novog korisnika</DialogTitle>
              <DialogDescription>Unesite podatke za novog korisnika.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
                <FormField control={createForm.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Korisničko ime</FormLabel>
                    <FormControl><Input {...field} data-testid="input-create-username" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lozinka</FormLabel>
                    <FormControl><Input type="password" {...field} data-testid="input-create-password" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ime i prezime</FormLabel>
                    <FormControl><Input {...field} data-testid="input-create-fullName" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} data-testid="input-create-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uloga</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Učenik</SelectItem>
                        <SelectItem value="teacher">Učitelj</SelectItem>
                        <SelectItem value="parent">Roditelj</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="schoolName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Škola</FormLabel>
                    <FormControl><Input {...field} data-testid="input-create-schoolName" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="className" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razred</FormLabel>
                    <FormControl><Input {...field} data-testid="input-create-className" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="parentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID roditelja</FormLabel>
                    <FormControl><Input {...field} data-testid="input-create-parentId" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create-user">
                    {createMutation.isPending ? "Spremanje..." : "Dodaj korisnika"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova radnja je nepovratna. Korisnik "{deleteUser?.fullName}" će biti trajno obrisan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-user">Odustani</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
                data-testid="button-confirm-delete-user"
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
