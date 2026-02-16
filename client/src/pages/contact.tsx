import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertContactMessageSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const contactFormSchema = insertContactMessageSchema.extend({
  name: z.string().min(2, "Ime mora imati najmanje 2 znaka"),
  email: z.string().email("Unesite ispravnu email adresu"),
  subject: z.string().min(3, "Predmet mora imati najmanje 3 znaka"),
  message: z.string().min(10, "Poruka mora imati najmanje 10 znakova"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "info@citajvise.hr",
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+385 1 234 5678",
  },
  {
    icon: MapPin,
    label: "Adresa",
    value: "Ilica 42, 10000 Zagreb, Hrvatska",
  },
];

export default function ContactPage() {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Poruka poslana!",
        description: "Hvala vam na poruci. Odgovorit ćemo vam u najkraćem roku.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Greška",
        description: "Došlo je do greške pri slanju poruke. Pokušajte ponovo.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ContactFormValues) {
    contactMutation.mutate(data);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="text-3xl font-bold sm:text-4xl"
              data-testid="text-contact-title"
            >
              Kontakt
            </h1>
            <p className="mt-4 text-muted-foreground">
              Imate pitanje ili prijedlog? Javite nam se!
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <motion.div
              className="space-y-6 lg:col-span-1"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {contactInfo.map((item) => (
                <Card key={item.label} data-testid={`card-contact-${item.label.toLowerCase()}`}>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div
              className="lg:col-span-2"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                      data-testid="form-contact"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ime i prezime</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Vaše ime"
                                  data-testid="input-name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="vas@email.com"
                                  data-testid="input-email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Predmet</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="O čemu se radi?"
                                data-testid="input-subject"
                                {...field}
                              />
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
                                placeholder="Napišite svoju poruku..."
                                className="min-h-[120px]"
                                data-testid="input-message"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={contactMutation.isPending}
                        data-testid="button-submit-contact"
                      >
                        {contactMutation.isPending ? (
                          "Slanje..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Pošalji poruku
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
