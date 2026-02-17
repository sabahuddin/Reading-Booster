import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, School, Building2 } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loginSchema = z.object({
  username: z.string().min(1, "Korisničko ime je obavezno"),
  password: z.string().min(1, "Lozinka je obavezna"),
});

type LoginValues = z.infer<typeof loginSchema>;

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Korisničko ime mora imati najmanje 3 znaka"),
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 znakova"),
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
  role: z.enum(["student", "parent"]),
  ageGroup: z.enum(["M", "D", "O", "A"]).default("M"),
  schoolName: z.string().optional().nullable(),
  className: z.string().optional().nullable(),
});

type RegisterValues = z.infer<typeof registerSchema>;

const institutionSchema = insertUserSchema.extend({
  username: z.string().min(3, "Korisničko ime mora imati najmanje 3 znaka"),
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 znakova"),
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
  institutionType: z.enum(["school", "mekteb"], { required_error: "Odaberite tip institucije" }),
  institutionRole: z.enum(["ucitelj", "muallim", "bibliotekar", "sekretar"], { required_error: "Odaberite vašu ulogu" }),
  schoolName: z.string().min(2, "Naziv institucije je obavezan"),
  className: z.string().optional().nullable(),
});

type InstitutionValues = z.infer<typeof institutionSchema>;

function getDashboardPath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "teacher":
      return "/ucitelj";
    case "parent":
      return "/roditelj";
    case "student":
      return "/ucenik";
    default:
      return "/";
  }
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation(getDashboardPath(user.role));
    }
  }, [isAuthenticated, user, setLocation]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "student",
      ageGroup: "M",
      schoolName: "",
      className: "",
    },
  });

  const institutionForm = useForm<InstitutionValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      institutionType: undefined,
      institutionRole: undefined,
      schoolName: "",
      className: "",
      role: "teacher",
    },
  });

  const selectedRole = registerForm.watch("role");

  async function onLogin(data: LoginValues) {
    try {
      await login.mutateAsync(data);
    } catch (error: any) {
      toast({
        title: "Greška pri prijavi",
        description: error.message || "Neispravno korisničko ime ili lozinka.",
        variant: "destructive",
      });
    }
  }

  async function onRegister(data: RegisterValues) {
    try {
      const submitData = { ...data };
      if (data.role === "parent") {
        submitData.schoolName = null;
        submitData.className = null;
      }
      await register.mutateAsync(submitData);
    } catch (error: any) {
      toast({
        title: "Greška pri registraciji",
        description: error.message || "Registracija nije uspjela. Pokušajte ponovo.",
        variant: "destructive",
      });
    }
  }

  async function onInstitutionRegister(data: InstitutionValues) {
    try {
      const submitData = {
        ...data,
        role: "teacher" as const,
      };
      const result: any = await register.mutateAsync(submitData);
      if (result?.pendingApproval) {
        toast({
          title: "Zahtjev poslan!",
          description: "Vaš zahtjev za registraciju institucije je poslan. Administrator će odobriti vaš račun.",
        });
        setActiveTab("login");
      }
    } catch (error: any) {
      toast({
        title: "Greška pri registraciji",
        description: error.message || "Registracija nije uspjela. Pokušajte ponovo.",
        variant: "destructive",
      });
    }
  }

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="text-auth-title">
                Dobrodošli
              </CardTitle>
              <CardDescription data-testid="text-auth-description">
                Prijavite se ili kreirajte novi račun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3" data-testid="tabs-auth">
                  <TabsTrigger value="login" data-testid="tab-login">
                    Prijava
                  </TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">
                    Registracija
                  </TabsTrigger>
                  <TabsTrigger value="institution" data-testid="tab-institution">
                    <School className="h-4 w-4 mr-1" />
                    Institucija
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLogin)}
                      className="space-y-4 mt-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Korisničko ime</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Unesite korisničko ime"
                                data-testid="input-login-username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lozinka</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Unesite lozinku"
                                data-testid="input-login-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={login.isPending}
                        data-testid="button-login-submit"
                      >
                        {login.isPending ? "Prijavljivanje..." : "Prijavi se"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegister)}
                      className="space-y-4 mt-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ime i prezime</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Unesite ime i prezime"
                                data-testid="input-register-fullname"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Unesite email adresu"
                                data-testid="input-register-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Korisničko ime</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Odaberite korisničko ime"
                                data-testid="input-register-username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lozinka</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Odaberite lozinku"
                                data-testid="input-register-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="ageGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starosna skupina</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-register-age-group">
                                  <SelectValue placeholder="Odaberite..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="M">M – Mlađi osnovci (6-10)</SelectItem>
                                <SelectItem value="D">D – Stariji osnovci (11-15)</SelectItem>
                                <SelectItem value="O">O – Omladina (15-18)</SelectItem>
                                <SelectItem value="A">A – Odrasli (18+)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uloga</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-register-role">
                                  <SelectValue placeholder="Odaberite ulogu" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student" data-testid="select-role-student">
                                  Učenik
                                </SelectItem>
                                <SelectItem value="parent" data-testid="select-role-parent">
                                  Roditelj
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {field.value === "parent" && (
                              <FormDescription className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-800 dark:text-blue-200">
                                Kao roditelj, moći ćete povezati račune svoje djece nakon prijave na Vašem panelu koristeći njihova korisnička imena i lozinke.
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedRole === "student" && (
                        <>
                          <FormField
                            control={registerForm.control}
                            name="schoolName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Naziv škole (opcionalno)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Unesite naziv škole"
                                    data-testid="input-register-school"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="className"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Razred (opcionalno)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Unesite razred"
                                    data-testid="input-register-class"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={register.isPending}
                        data-testid="button-register-submit"
                      >
                        {register.isPending ? "Registracija..." : "Registriraj se"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="institution">
                  <div className="mt-2 mb-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0" />
                      Registracija za biblioteke, škole i mektebe. Vaš račun će biti aktivan nakon odobrenja administratora.
                    </p>
                  </div>
                  <Form {...institutionForm}>
                    <form
                      onSubmit={institutionForm.handleSubmit(onInstitutionRegister)}
                      className="space-y-4"
                    >
                      <FormField
                        control={institutionForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ime i prezime</FormLabel>
                            <FormControl>
                              <Input placeholder="Vaše ime i prezime" data-testid="input-inst-fullname" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Vaš email" data-testid="input-inst-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Korisničko ime</FormLabel>
                            <FormControl>
                              <Input placeholder="Odaberite korisničko ime" data-testid="input-inst-username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lozinka</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Odaberite lozinku" data-testid="input-inst-password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="institutionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tip institucije</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-inst-type">
                                  <SelectValue placeholder="Odaberite tip" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="school">Škola</SelectItem>
                                <SelectItem value="mekteb">Biblioteka</SelectItem>
                                <SelectItem value="mekteb">Mekteb</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="institutionRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vaša uloga</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-inst-role">
                                  <SelectValue placeholder="Odaberite ulogu" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ucitelj">Učitelj</SelectItem>
                                <SelectItem value="muallim">Muallim</SelectItem>
                                <SelectItem value="bibliotekar">Bibliotekar</SelectItem>
                                <SelectItem value="sekretar">Sekretar</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Naziv institucije</FormLabel>
                            <FormControl>
                              <Input placeholder="Naziv biblioteke, škole ili mekteba" data-testid="input-inst-school" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={institutionForm.control}
                        name="className"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razred / Grupa (opcionalno)</FormLabel>
                            <FormControl>
                              <Input placeholder="npr. 5a" data-testid="input-inst-class" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={register.isPending}
                        data-testid="button-inst-submit"
                      >
                        {register.isPending ? "Slanje zahtjeva..." : "Pošalji zahtjev za registraciju"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-[hsl(262,80%,55%)] via-[hsl(280,70%,45%)] to-[hsl(310,65%,40%)]">
          <div className="max-w-md text-center text-white p-8">
            <BookOpen className="mx-auto mb-6 h-16 w-16" />
            <h2 className="mb-4 text-3xl font-bold" data-testid="text-branding-title">
              Čitanje!
            </h2>
            <p className="text-lg text-blue-100" data-testid="text-branding-tagline">
              Interaktivna platforma za čitanje koja povezuje čitatelje - učenike, nastavnike/muallime i
              roditelje. Razvijajte ljubav prema knjigama kroz kvizove, praćenje
              napretka i zajedničko učenje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
