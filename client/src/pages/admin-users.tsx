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
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Search, Download, UserX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type UserWithoutPassword = Omit<User, "password">;

const subscriptionLabels: Record<string, string> = {
  free: "Besplatni",
  standard: "Standard",
  full: "Full",
};

const editUserSchema = z.object({
  fullName: z.string().min(1, "Ime je obavezno"),
  email: z.string().email("Neispravan email"),
  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: "Lozinka mora imati barem 6 znakova",
  }),
  role: z.enum(["student", "teacher", "parent", "admin", "school_admin", "reader"]),
  schoolName: z.string().optional(),
  className: z.string().optional(),
  parentId: z.string().optional(),
  maxStudentAccounts: z.coerce.number().int().min(0).optional(),
  subscriptionType: z.enum(["free", "standard", "full"]).optional(),
  subscriptionExpiresAt: z.string().optional(),
});

const createUserSchema = z.object({
  username: z.string().min(3, "Korisničko ime mora imati barem 3 znaka"),
  password: z.string().min(6, "Lozinka mora imati barem 6 znakova"),
  fullName: z.string().min(1, "Ime je obavezno"),
  email: z.string().email("Neispravan email"),
  role: z.enum(["student", "teacher", "parent", "admin", "school_admin", "reader"]),
  schoolName: z.string().optional(),
  className: z.string().optional(),
  parentId: z.string().optional(),
  maxStudentAccounts: z.coerce.number().int().min(0).optional(),
});

type EditUserValues = z.infer<typeof editUserSchema>;
type CreateUserValues = z.infer<typeof createUserSchema>;

const roleLabels: Record<string, string> = {
  student: "Učenik",
  teacher: "Učitelj/Nastavnik",
  parent: "Roditelj",
  admin: "Administrator",
  school_admin: "Školski administrator",
  reader: "Čitalac",
  school: "Škola",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "default",
  school_admin: "default",
  teacher: "secondary",
  parent: "secondary",
  reader: "outline",
  student: "outline",
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithoutPassword | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState(false);

  const { data: users, isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchesSearch = searchQuery === "" ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const editForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "", email: "", password: "", role: "student",
      schoolName: "", className: "", parentId: "",
      maxStudentAccounts: 0,
    },
  });

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "", password: "", fullName: "", email: "", role: "student",
      schoolName: "", className: "", parentId: "",
      maxStudentAccounts: 0,
    },
  });

  const watchedEditRole = editForm.watch("role");
  const watchedCreateRole = createForm.watch("role");

  const updateMutation = useMutation({
    mutationFn: async (data: EditUserValues) => {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.password) delete payload.password;
      if (!payload.schoolName) delete payload.schoolName;
      if (!payload.className) delete payload.className;
      if (!payload.parentId) delete payload.parentId;
      if (!payload.subscriptionExpiresAt) delete payload.subscriptionExpiresAt;
      if (payload.maxStudentAccounts === undefined || payload.maxStudentAccounts === "") delete payload.maxStudentAccounts;
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

  const bulkDeactivateMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiRequest("POST", "/api/admin/users/bulk-deactivate", { userIds: ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: `Deaktivirano ${selectedUsers.size} korisnika` });
      setSelectedUsers(new Set());
      setBulkDeactivateOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  function handleExportCSV() {
    window.open("/api/admin/users/export-csv", "_blank");
  }

  function toggleSelectUser(id: string) {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  }

  function openEdit(user: UserWithoutPassword) {
    setEditingUser(user);
    editForm.reset({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role as EditUserValues["role"],
      schoolName: user.schoolName ?? "",
      className: user.className ?? "",
      parentId: user.parentId ?? "",
      maxStudentAccounts: user.maxStudentAccounts ?? 0,
      subscriptionType: (user.subscriptionType as "free" | "standard" | "full") ?? "free",
      subscriptionExpiresAt: user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toISOString().split("T")[0] : "",
    });
    setEditDialogOpen(true);
  }

  const roleOptions = [
    { value: "student", label: "Učenik" },
    { value: "teacher", label: "Učitelj/Nastavnik" },
    { value: "parent", label: "Roditelj" },
    { value: "admin", label: "Administrator" },
    { value: "school_admin", label: "Školski administrator" },
    { value: "reader", label: "Čitalac" },
  ];

  function RoleFields({ role, control, prefix }: { role: string; control: any; prefix: "edit" | "create" }) {
    return (
      <>
        {/* School name — for teacher, school_admin */}
        {(role === "teacher" || role === "school_admin") && (
          <FormField control={control} name="schoolName" render={({ field }) => (
            <FormItem>
              <FormLabel>Naziv škole</FormLabel>
              <FormControl><Input {...field} data-testid={`input-${prefix}-schoolName`} placeholder="Npr. OŠ Mehmed Akif" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* Class — for teacher and student */}
        {(role === "teacher" || role === "student") && (
          <FormField control={control} name="className" render={({ field }) => (
            <FormItem>
              <FormLabel>{role === "teacher" ? "Razred(i) koje predaje" : "Razred"}</FormLabel>
              <FormControl><Input {...field} data-testid={`input-${prefix}-className`} placeholder={role === "teacher" ? "Npr. 5a, 6b" : "Npr. 4a"} /></FormControl>
              <FormDescription className="text-xs">
                {role === "teacher" ? "Unesite razrede odvojene zarezom" : "Razred u koji učenik ide"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* License count (maxStudentAccounts) — for teacher and school_admin */}
        {(role === "teacher" || role === "school_admin") && (
          <FormField control={control} name="maxStudentAccounts" render={({ field }) => (
            <FormItem>
              <FormLabel>
                {role === "teacher" ? "Broj licenci (učenika)" : "Maks. broj učenika u školi"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  {...field}
                  data-testid={`input-${prefix}-maxStudents`}
                  placeholder="Npr. 30"
                />
              </FormControl>
              <FormDescription className="text-xs">
                {role === "teacher"
                  ? "Koliko učeničkih računa učitelj može kreirati"
                  : "Ukupan broj učenika za ovu školu"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* Parent ID — only for students */}
        {role === "student" && (
          <FormField control={control} name="parentId" render={({ field }) => (
            <FormItem>
              <FormLabel>ID roditelja (opcionalno)</FormLabel>
              <FormControl><Input {...field} data-testid={`input-${prefix}-parentId`} placeholder="UUID roditelja" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}
      </>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold" data-testid="text-users-title">Upravljanje korisnicima</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedUsers.size > 0 && (
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setBulkDeactivateOpen(true)} data-testid="button-bulk-deactivate">
                <UserX className="mr-2 h-4 w-4" />
                Deaktiviraj ({selectedUsers.size})
              </Button>
            )}
            <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
              <Download className="mr-2 h-4 w-4" />
              Izvoz CSV
            </Button>
            <Button onClick={() => { createForm.reset(); setCreateDialogOpen(true); }} data-testid="button-add-user">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj korisnika
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po imenu, korisničkom imenu ili emailu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[220px]" data-testid="select-role-filter">
              <SelectValue placeholder="Filtriraj po ulozi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve uloge</SelectItem>
              <SelectItem value="student">Učenik</SelectItem>
              <SelectItem value="teacher">Učitelj/Nastavnik</SelectItem>
              <SelectItem value="parent">Roditelj</SelectItem>
              <SelectItem value="reader">Čitalac</SelectItem>
              <SelectItem value="school_admin">Školski administrator</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          {roleFilter !== "all" && (
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} korisnik(a)
            </div>
          )}
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
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                        onCheckedChange={toggleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Škola / Razred</TableHead>
                    <TableHead>Bodovi</TableHead>
                    <TableHead>Licence</TableHead>
                    <TableHead>Pretplata</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`} className={selectedUsers.has(user.id) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => toggleSelectUser(user.id)}
                            data-testid={`checkbox-user-${user.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{user.username}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariant[user.role] ?? "outline"}>
                            {roleLabels[user.role] ?? user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.schoolName && <div className="font-medium">{user.schoolName}</div>}
                          {user.className && <div className="text-muted-foreground">{user.className}</div>}
                          {!user.schoolName && !user.className && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell>
                          {(user.role === "teacher" || user.role === "school_admin") && user.maxStudentAccounts != null
                            ? <span className="text-sm font-medium">{user.maxStudentAccounts}</span>
                            : <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.subscriptionType === "free" ? "outline" : user.subscriptionType === "full" ? "default" : "secondary"}>
                            {subscriptionLabels[user.subscriptionType] ?? "Besplatni"}
                          </Badge>
                        </TableCell>
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
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {searchQuery || roleFilter !== "all"
                          ? `Nema korisnika za odabrani filter${roleFilter !== "all" ? ` (${roleLabels[roleFilter] ?? roleFilter})` : ""}.`
                          : "Nema korisnika."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
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
                        {roleOptions.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <RoleFields role={watchedEditRole} control={editForm.control} prefix="edit" />

                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-medium mb-3">Pretplata</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={editForm.control} name="subscriptionType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tip pretplate</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "free"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-subscription">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="free">Besplatni</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="subscriptionExpiresAt" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ističe</FormLabel>
                        <FormControl><Input type="date" {...field} data-testid="input-edit-subscriptionExpires" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit-user">
                    {updateMutation.isPending ? "Spremanje..." : "Spremi promjene"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dodaj novog korisnika</DialogTitle>
              <DialogDescription>Unesite podatke za novog korisnika.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
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
                        {roleOptions.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
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
                </div>
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

                <RoleFields role={watchedCreateRole} control={createForm.control} prefix="create" />

                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create-user">
                    {createMutation.isPending ? "Spremanje..." : "Dodaj korisnika"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={bulkDeactivateOpen} onOpenChange={setBulkDeactivateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deaktiviraj korisnike</AlertDialogTitle>
              <AlertDialogDescription>
                Da li ste sigurni da želite deaktivirati {selectedUsers.size} odabranih korisnika? Oni se neće moći prijaviti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Odustani</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => bulkDeactivateMutation.mutate(Array.from(selectedUsers))}
                className="bg-destructive hover:bg-destructive/80"
                data-testid="button-confirm-bulk-deactivate"
              >
                {bulkDeactivateMutation.isPending ? "Deaktiviranje..." : "Deaktiviraj"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
