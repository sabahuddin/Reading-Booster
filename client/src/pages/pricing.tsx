import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, Star, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const plans = [
  {
    name: "Čitatelj",
    price: "0",
    period: "KM",
    description: "Savršen za početak",
    icon: Star,
    features: [
      "Pristup javnoj biblioteci",
      "Rješavanje kvizova",
      "Sakupljanje bodova",
      "Prisustvo na tabeli čitača",
    ],
    cta: "Započni besplatno",
    featured: false,
    href: "/prijava",
  },
  {
    name: "Čitatelj Pro",
    price: "10",
    period: "KM/godišnje",
    description: "Za strastvene čitaoce",
    icon: Sparkles,
    features: [
      "Sve iz besplatnog paketa",
      "Neograničen broj kvizova",
      "Detaljne statistike čitanja",
      "Digitalne diplome za postignuća",
      "Prioritetna podrška",
    ],
    cta: "Odaberi Čitatelj Pro",
    featured: true,
    href: "/prijava",
  },
  {
    name: "Porodični",
    price: "Od 15",
    period: "KM/godišnje",
    description: "Zajedničko čitanje i takmičenje",
    icon: Users,
    features: [
      "Sve iz Čitatelj Pro paketa",
      "Više povezanih računa",
      "Roditeljski nadzor i praćenje",
      "Porodična rang lista",
      "Učešće u porodičnim izazovima",
    ],
    cta: "Odaberi porodični paket",
    featured: false,
    href: "/prijava",
    familyOptions: [
      { label: "1 roditelj + 1 dijete", price: "15 KM/godišnje" },
      { label: "1 roditelj + 3 djece", price: "20 KM/godišnje" },
      { label: "2 roditelja + 3 djece", price: "25 KM/godišnje" },
    ],
  },
];

export default function PricingPage() {
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
              data-testid="text-pricing-title"
            >
              Cijene i paketi
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Odaberite paket koji najbolje odgovara vašim potrebama. Započnite besplatno ili nadogradite za više mogućnosti.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeIn}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={plan.featured ? "md:-mt-4 md:mb-[-1rem]" : ""}
                >
                  <Card
                    className={`relative h-full flex flex-col ${
                      plan.featured
                        ? "border-primary ring-2 ring-primary/20"
                        : ""
                    }`}
                    data-testid={`card-pricing-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge data-testid="badge-popular">
                          Najpopularniji
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto mb-2">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col p-6 pt-0">
                      <div className="my-6 text-center">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="ml-1 text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>

                      <ul className="flex-1 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.familyOptions && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Opcije</p>
                          {plan.familyOptions.map((opt) => (
                            <div key={opt.label} className="flex items-center justify-between text-sm gap-2">
                              <span>{opt.label}</span>
                              <span className="font-semibold whitespace-nowrap">{opt.price}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-8">
                        <Link href={plan.href}>
                          <Button
                            className="w-full"
                            variant={plan.featured ? "default" : "outline"}
                            data-testid={`button-pricing-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2" data-testid="text-school-pricing">Paket za škole</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Za škole i obrazovne ustanove nudimo posebne uvjete. 
                  Kontaktirajte nas za prilagođenu ponudu koja uključuje upravljanje razredima, 
                  izvještaje i grupne pretplate.
                </p>
                <Link href="/kontakt">
                  <Button variant="outline" data-testid="button-contact-school">
                    Kontaktirajte nas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
