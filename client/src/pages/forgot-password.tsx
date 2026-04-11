import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { KeyRound, ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const schema = z.object({
  usernameOrEmail: z.string().min(1, "Unesite korisničko ime ili e-mail"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { usernameOrEmail: "" },
  });

  async function onSubmit(data: Values) {
    try {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      const body = await res.json();
      if (body.token) {
        setToken(body.token);
      } else {
        toast({ title: "Informacija", description: body.message });
      }
    } catch {
      toast({ title: "Greška", description: "Došlo je do greške. Pokušajte ponovo.", variant: "destructive" });
    }
  }

  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(token).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Zaboravljena lozinka</CardTitle>
            <CardDescription>
              Unesite vaše korisničko ime ili e-mail adresu. Dobićete token za resetovanje lozinke.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="usernameOrEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Korisničko ime ili e-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="npr. ucenik1 ili ucenik@skola.ba"
                            data-testid="input-username-or-email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
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
                    data-testid="button-forgot-submit"
                  >
                    {form.formState.isSubmitting ? "Šaljem..." : "Generiši token za reset"}
                  </Button>
                  <div className="text-center">
                    <Link href="/prijava" className="text-sm text-muted-foreground hover:underline" data-testid="link-back-login">
                      <ArrowLeft className="inline h-3.5 w-3.5 mr-1" />
                      Nazad na prijavu
                    </Link>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Token je uspješno kreiran. Kopirajte ga i koristite na stranici za reset lozinke.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Vaš reset token:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all" data-testid="text-reset-token">
                      {token}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyToken} data-testid="button-copy-token">
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Token ističe za 2 sata.</p>
                </div>

                <Link href="/reset-lozinke">
                  <Button className="w-full" data-testid="button-go-reset">
                    Idi na reset lozinke →
                  </Button>
                </Link>
                <div className="text-center">
                  <Link href="/prijava" className="text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="inline h-3.5 w-3.5 mr-1" />
                    Nazad na prijavu
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
