import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { LockKeyhole, ArrowLeft, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const schema = z.object({
  token: z.string().min(10, "Unesite token koji ste dobili"),
  newPassword: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova")
    .regex(/[A-Z]/, "Lozinka mora sadržati najmanje jedno veliko slovo")
    .regex(/[0-9]/, "Lozinka mora sadržati najmanje jedan broj"),
  confirmPassword: z.string().min(1, "Potvrdite lozinku"),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Lozinke se ne podudaraju",
  path: ["confirmPassword"],
});

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: Values) {
    try {
      const res = await apiRequest("POST", "/api/auth/reset-password", {
        token: data.token,
        newPassword: data.newPassword,
      });
      const body = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setLocation("/prijava"), 3000);
      } else {
        toast({ title: "Greška", description: body.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Greška", description: "Došlo je do greške. Pokušajte ponovo.", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <LockKeyhole className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Resetuj lozinku</CardTitle>
            <CardDescription>
              Unesite token koji ste dobili i novu lozinku.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Lozinka je uspješno promijenjena! Preusmjeravamo vas na stranicu za prijavu...
                  </AlertDescription>
                </Alert>
                <Link href="/prijava">
                  <Button className="w-full" data-testid="button-go-login">Idi na prijavu</Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reset token</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Zalijepite token ovdje"
                            data-testid="input-reset-token"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova lozinka</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Min. 8 znakova, 1 veliko slovo, 1 broj"
                            data-testid="input-new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potvrdi novu lozinku</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Ponovite lozinku"
                            data-testid="input-confirm-password"
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
                    disabled={form.formState.isSubmitting}
                    data-testid="button-reset-submit"
                  >
                    {form.formState.isSubmitting ? "Resetujem..." : "Resetuj lozinku"}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <Link href="/zaboravljena-lozinka" className="text-muted-foreground hover:underline">
                      Generiši novi token
                    </Link>
                    <Link href="/prijava" className="text-muted-foreground hover:underline">
                      <ArrowLeft className="inline h-3.5 w-3.5 mr-1" />
                      Prijava
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
