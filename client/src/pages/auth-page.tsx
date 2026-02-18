import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { School, ShieldCheck } from "lucide-react";
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
  pricingPlan: z.string().optional(),
  captchaAnswer: z.string().min(1, "Odgovorite na sigurnosno pitanje"),
});

type RegisterValues = z.infer<typeof registerSchema>;

const schoolSchema = insertUserSchema.extend({
  username: z.string().min(3, "Korisničko ime mora imati najmanje 3 znaka"),
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 znakova"),
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
  schoolName: z.string().min(2, "Naziv škole je obavezan"),
  className: z.string().optional().nullable(),
  captchaAnswer: z.string().min(1, "Odgovorite na sigurnosno pitanje"),
});

type SchoolValues = z.infer<typeof schoolSchema>;

function generateCaptcha(): { question: string; answer: number } {
  const operations = [
    () => {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return { question: `${a} + ${b} = ?`, answer: a + b };
    },
    () => {
      const answer = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const sum = answer + b;
      return { question: `${sum} - ${b} = ?`, answer };
    },
    () => {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      return { question: `${a} x ${b} = ?`, answer: a * b };
    },
  ];
  const op = operations[Math.floor(Math.random() * operations.length)];
  return op();
}

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
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [schoolCaptcha, setSchoolCaptcha] = useState(() => generateCaptcha());

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
      pricingPlan: "free",
      captchaAnswer: "",
    },
  });

  const schoolForm = useForm<SchoolValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      schoolName: "",
      className: "",
      role: "teacher",
      captchaAnswer: "",
    },
  });

  const selectedRole = registerForm.watch("role");
  const selectedPlan = registerForm.watch("pricingPlan");

  const isFamilyPlan = selectedPlan && selectedPlan.startsWith("family_");

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
    const parsed = Number(data.captchaAnswer);
    if (isNaN(parsed) || parsed !== captcha.answer) {
      toast({
        title: "Netačan odgovor",
        description: "Odgovor na sigurnosno pitanje nije tačan. Pokušajte ponovo.",
        variant: "destructive",
      });
      setCaptcha(generateCaptcha());
      registerForm.setValue("captchaAnswer", "");
      return;
    }

    try {
      const { captchaAnswer, ...submitData } = data;
      await register.mutateAsync(submitData);
    } catch (error: any) {
      toast({
        title: "Greška pri registraciji",
        description: error.message || "Registracija nije uspjela. Pokušajte ponovo.",
        variant: "destructive",
      });
      setCaptcha(generateCaptcha());
      registerForm.setValue("captchaAnswer", "");
    }
  }

  async function onSchoolRegister(data: SchoolValues) {
    const parsed = Number(data.captchaAnswer);
    if (isNaN(parsed) || parsed !== schoolCaptcha.answer) {
      toast({
        title: "Netačan odgovor",
        description: "Odgovor na sigurnosno pitanje nije tačan. Pokušajte ponovo.",
        variant: "destructive",
      });
      setSchoolCaptcha(generateCaptcha());
      schoolForm.setValue("captchaAnswer", "");
      return;
    }

    try {
      const { captchaAnswer, ...rest } = data;
      const submitData = {
        ...rest,
        role: "teacher" as const,
        institutionType: "school" as const,
        institutionRole: "ucitelj" as const,
      };
      const result: any = await register.mutateAsync(submitData);
      if (result?.pendingApproval) {
        toast({
          title: "Zahtjev poslan!",
          description: "Vaš zahtjev za registraciju škole je poslan. Administrator će odobriti vaš račun.",
        });
        setActiveTab("login");
      }
    } catch (error: any) {
      toast({
        title: "Greška pri registraciji",
        description: error.message || "Registracija nije uspjela. Pokušajte ponovo.",
        variant: "destructive",
      });
      setSchoolCaptcha(generateCaptcha());
      schoolForm.setValue("captchaAnswer", "");
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
                  <TabsTrigger value="school" data-testid="tab-school">
                    <School className="h-4 w-4 mr-1" />
                    Škola
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
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registriram se kao</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-register-role">
                                  <SelectValue placeholder="Odaberite..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student" data-testid="select-role-student">
                                  Čitalac (samo ja)
                                </SelectItem>
                                <SelectItem value="parent" data-testid="select-role-parent">
                                  Roditelj / Porodica
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                                <SelectItem value="M">M - Mlađi osnovci (6-10)</SelectItem>
                                <SelectItem value="D">D - Stariji osnovci (11-15)</SelectItem>
                                <SelectItem value="O">O - Omladina (15-18)</SelectItem>
                                <SelectItem value="A">A - Odrasli (18+)</SelectItem>
                              </SelectContent>
                            </Select>
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
                                    <SelectTrigger data-testid="select-register-plan">
                                      <SelectValue placeholder="Odaberite paket" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="free">Čitalac (Besplatno)</SelectItem>
                                    <SelectItem value="pro">Čitalac Pro (10 KM/godišnje)</SelectItem>
                                    <SelectItem value="family_1_1">Porodica 15 KM (1 roditelj + 1 dijete)</SelectItem>
                                    <SelectItem value="family_1_3">Porodica 20 KM (1 roditelj + 3 djece)</SelectItem>
                                    <SelectItem value="family_2_3">Porodica 25 KM (2 roditelja + 3 djece)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {isFamilyPlan && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                              <p className="font-medium mb-1">Dodavanje članova porodice</p>
                              <p>Nakon registracije, moći ćete dodati račune za svoju djecu i drugog roditelja u svom profilu. Svaki član porodice dobija vlastito korisničko ime i lozinku.</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-3 bg-muted rounded-md border">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold uppercase text-muted-foreground">Sigurnosno pitanje</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold whitespace-nowrap">{captcha.question}</span>
                          <FormField
                            control={registerForm.control}
                            name="captchaAnswer"
                            render={({ field }) => (
                              <FormItem className="flex-1 space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="?"
                                    className="h-9 text-center text-lg font-bold"
                                    data-testid="input-register-captcha"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

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

                <TabsContent value="school">
                  <div className="mt-2 mb-4 p-3 bg-muted rounded-md border-l-4 border-orange-500">
                    <p className="text-sm font-medium">
                      Registracija za škole. Nakon što pošaljete zahtjev, administrator će odobriti vaš račun.
                    </p>
                  </div>
                  <Form {...schoolForm}>
                    <form
                      onSubmit={schoolForm.handleSubmit(onSchoolRegister)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={schoolForm.control}
                          name="schoolName"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Naziv škole</FormLabel>
                              <FormControl>
                                <Input placeholder="Npr. Druga osnovna škola" data-testid="input-school-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={schoolForm.control}
                          name="className"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Mjesto / Grad</FormLabel>
                              <FormControl>
                                <Input placeholder="Unesite grad" data-testid="input-school-city" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="my-4 border-t pt-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Kontakt podaci administratora</p>
                        <div className="space-y-3">
                          <FormField
                            control={schoolForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ime i prezime</FormLabel>
                                <FormControl>
                                  <Input placeholder="Vaše ime i prezime" data-testid="input-school-fullname" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={schoolForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Vaš email" data-testid="input-school-email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={schoolForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Korisničko ime</FormLabel>
                                <FormControl>
                                  <Input placeholder="Odaberite korisničko ime" data-testid="input-school-username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={schoolForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lozinka</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Odaberite lozinku" data-testid="input-school-password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md border">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold uppercase text-muted-foreground">Sigurnosno pitanje</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold whitespace-nowrap">{schoolCaptcha.question}</span>
                          <FormField
                            control={schoolForm.control}
                            name="captchaAnswer"
                            render={({ field }) => (
                              <FormItem className="flex-1 space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="?"
                                    className="h-9 text-center text-lg font-bold"
                                    data-testid="input-school-captcha"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={register.isPending}
                        data-testid="button-school-submit"
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
