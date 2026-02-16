import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen } from "lucide-react";
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
  role: z.enum(["student", "teacher", "parent"]),
  schoolName: z.string().optional().nullable(),
  className: z.string().optional().nullable(),
});

type RegisterValues = z.infer<typeof registerSchema>;

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
      schoolName: "",
      className: "",
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
                <TabsList className="grid w-full grid-cols-2" data-testid="tabs-auth">
                  <TabsTrigger value="login" data-testid="tab-login">
                    Prijava
                  </TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">
                    Registracija
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
                                <SelectItem value="teacher" data-testid="select-role-teacher">
                                  Učitelj
                                </SelectItem>
                                <SelectItem value="parent" data-testid="select-role-parent">
                                  Roditelj
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(selectedRole === "student" || selectedRole === "teacher") && (
                        <>
                          <FormField
                            control={registerForm.control}
                            name="schoolName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Naziv škole</FormLabel>
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
                                <FormLabel>Razred</FormLabel>
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
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-[hsl(210,85%,42%)] via-[hsl(210,85%,35%)] to-[hsl(210,85%,25%)]">
          <div className="max-w-md text-center text-white p-8">
            <BookOpen className="mx-auto mb-6 h-16 w-16" />
            <h2 className="mb-4 text-3xl font-bold" data-testid="text-branding-title">
              Čitaj!
            </h2>
            <p className="text-lg text-blue-100" data-testid="text-branding-tagline">
              Interaktivna platforma za čitanje koja povezuje učenike, nastavnike i
              roditelje. Razvijajte ljubav prema knjigama kroz kvizove, praćenje
              napretka i zajedničko učenje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
