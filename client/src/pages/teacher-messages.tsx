import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, CheckCircle2 } from "lucide-react";

const messageSchema = z.object({
  subject: z.string().min(3, "Tema mora imati najmanje 3 karaktera"),
  message: z.string().min(10, "Poruka mora imati najmanje 10 karaktera"),
});

type MessageValues = z.infer<typeof messageSchema>;

export default function TeacherMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const form = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { subject: "", message: "" },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: MessageValues) => {
      const body = `[Poruka od nastavnika]\nIme: ${user?.fullName || ""}\nKorisničko ime: ${user?.username || ""}\nŠkola: ${user?.schoolName || "—"}\n\n---\n\n${data.message}`;
      const res = await apiRequest("POST", "/api/contact", {
        name: user?.fullName || user?.username || "Nastavnik",
        email: `${user?.username || "ucitelj"}@citanje.ba`,
        subject: data.subject,
        message: body,
      });
      return res.json();
    },
    onSuccess: () => {
      setSent(true);
      form.reset();
    },
    onError: (err: any) => {
      toast({ title: "Greška pri slanju", description: err.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Poruke administraciji</h1>
        </div>

        <p className="text-muted-foreground text-sm">
          Ovdje možete poslati poruku administratorima platforme Čitanje.ba — prijava problema, prijedlozi ili pitanja.
        </p>

        {sent ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <h2 className="text-lg font-bold mb-1">Poruka uspješno poslana!</h2>
                <p className="text-muted-foreground text-sm">Administrator će pregledati vašu poruku u najkraćem mogućem roku.</p>
              </div>
              <Button variant="outline" onClick={() => setSent(false)} data-testid="button-send-another">
                Pošalji još jednu poruku
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nova poruka</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => sendMutation.mutate(d))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <FormControl>
                          <Input placeholder="Npr. Pitanje o kvizovima" data-testid="input-message-subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poruka</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Opišite vaše pitanje ili prijedlog..."
                            rows={6}
                            data-testid="textarea-message-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={sendMutation.isPending} data-testid="button-send-message">
                      {sendMutation.isPending ? (
                        "Slanje..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Pošalji poruku
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Šalje se kao: <strong>{user?.fullName || user?.username}</strong>
                      {user?.schoolName ? ` · ${user.schoolName}` : ""}
                    </span>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
