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
  role: z.enum(["student", "parent", "school"]),
  ageGroup: z.enum(["M", "D", "O", "A"]).default("M"),
  schoolName: z.string().optional().nullable(),
  className: z.string().optional().nullable(),
  pricingPlan: z.string().optional(),
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
    case "school":
      return "/skola";
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
      pricingPlan: "free",
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
                                <SelectItem value="school" data-testid="select-role-school">
                                  Ustanova (Škola/Medžlis)
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

                      {selectedRole === "parent" && (
                        <div className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="pricingPlan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Odaberite paket</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Odaberite paket" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="free">Čitatelj (Besplatno)</SelectItem>
                                    <SelectItem value="pro">Čitatelj Pro (10 KM/godišnje)</SelectItem>
                                    <SelectItem value="family_1_1">Porodica 15 KM (1 roditelj + 1 dijete)</SelectItem>
                                    <SelectItem value="family_1_3">Porodica 20 KM (1 roditelj + 3 djece)</SelectItem>
                                    <SelectItem value="family_2_3">Porodica 25 KM (2 roditelja + 3 djece)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 gap-2 p-3 bg-muted rounded-md border border-dashed">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dodatni računi</p>
                            <Input placeholder="Korisničko ime dijete 1" className="h-8 text-sm" />
                            {(registerForm.watch("pricingPlan") === "family_1_3" || registerForm.watch("pricingPlan") === "family_2_3") && (
                              <>
                                <Input placeholder="Korisničko ime dijete 2" className="h-8 text-sm" />
                                <Input placeholder="Korisničko ime dijete 3" className="h-8 text-sm" />
                              </>
                            )}
                            {registerForm.watch("pricingPlan") === "family_2_3" && (
                              <Input placeholder="Korisničko ime roditelj 2" className="h-8 text-sm" />
                            )}
                          </div>
                        </div>
                      )}

                      {selectedRole === "school" && (
                        <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-md text-orange-800 dark:text-orange-200 text-sm">
                          Registracija za ustanove omogućava upravljanje nastavnim kadrom i velikim brojem učenika.
                        </div>
                      )}

                      {(selectedRole === "student" || selectedRole === "school") && (
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
                  <div className="mt-2 mb-4 p-3 bg-muted rounded-md border-l-4 border-orange-500">
                    <p className="text-sm font-medium">
                      Registracija za ustanove (Škole, Medžlise, Biblioteke). Javićemo vam se ubrzo nakon prijave.
                    </p>
                  </div>
                  <Form {...institutionForm}>
                    <form
                      onSubmit={institutionForm.handleSubmit(onInstitutionRegister)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={institutionForm.control}
                          name="schoolName"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Naziv institucije</FormLabel>
                              <FormControl>
                                <Input placeholder="Npr. Druga osnovna škola" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={institutionForm.control}
                          name="className" // Reusing this for 'Mjesto'
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Mjesto / Grad</FormLabel>
                              <FormControl>
                                <Input placeholder="Unesite grad" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Broj djece</FormLabel>
                          <Input type="number" placeholder="Npr. 300" className="h-9" />
                        </FormItem>
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Broj nastavnika</FormLabel>
                          <Input type="number" placeholder="Npr. 10" className="h-9" />
                        </FormItem>
                      </div>
                      
                      <div className="my-4 border-t pt-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Kontakt podaci administratora</p>
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
                            <FormItem className="mt-3">
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Vaš email" data-testid="input-inst-email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={register.isPending}
                        data-testid="button-inst-submit"
                      >
                        {register.isPending ? "Slanje..." : "Pošalji zahtjev za odobrenje"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
