import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, Star, Sparkles, Users, School } from "lucide-react";
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
    name: "Čitalac",
    price: "0",
    period: "KM",
    description: "Savršen za početak",
    icon: Star,
    features: [
      "Pristup javnoj biblioteci",
      "Rješavanje kvizova",
      "Sakupljanje bodova",
      "Prisustvo na tabeli čitalaca",
    ],
    cta: "Započni besplatno",
    featured: false,
    href: "/prijava?tab=register",
  },
  {
    name: "Čitalac Pro",
    price: "10",
    period: "KM",
    description: "Za strastvene čitaoce",
    icon: Sparkles,
    features: [
      "Sve iz besplatnog paketa",
      "Neograničen broj kvizova",
      "Detaljne statistike čitanja",
      "Digitalne diplome za postignuća",
      "Prioritetna podrška",
    ],
    cta: "Odaberi Čitalac Pro",
    featured: true,
    href: "/prijava?tab=register",
  },
  {
    name: "Porodični",
    price: "",
    period: "",
    description: "Zajedničko čitanje i takmičenje",
    icon: Users,
    features: [
      "Sve iz Čitalac Pro paketa",
      "Više povezanih računa",
      "Roditeljski nadzor i praćenje",
      "Porodična rang lista",
      "Učešće u porodičnim izazovima",
    ],
    cta: "Odaberi porodični paket",
    featured: false,
    href: "/prijava?tab=register",
    familyOptions: [
      { label: "1 roditelj + 1 dijete", price: "15 KM" },
      { label: "1 roditelj + 3 djece", price: "20 KM" },
      { label: "2 roditelja + 3 djece", price: "25 KM" },
    ],
  },
  {
    name: "Škole",
    price: "Po dogovoru",
    period: "",
    description: "Za škole i obrazovne ustanove",
    icon: School,
    features: [
      "Sve iz Čitalac Pro paketa",
      "Upravljanje razredima i učenicima",
      "Kreiranje učeničkih računa",
      "Detaljni izvještaji i statistike",
      "CSV export podataka",
      "Sedmični izazovi za razrede",
      "Grupna pretplata za cijelu školu",
      "Prioritetna podrška i obuka",
    ],
    cta: "Kontaktirajte nas",
    featured: false,
    href: "/kontakt",
  },
];

export default function PricingPage() {
  const [showFamilyOptions, setShowFamilyOptions] = useState(false);

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
              className="text-4xl font-bold sm:text-5xl"
              data-testid="text-pricing-title"
            >
              Cijene i paketi
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Odaberite paket koji najbolje odgovara vašim potrebama. Započnite besplatno ili nadogradite za više mogućnosti.
            </p>
            <p className="mt-3 text-base font-semibold text-primary">
              Svi paketi su na godišnjem nivou
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <p className="text-base text-muted-foreground">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col p-6 pt-0">
                      {plan.price && (
                        <div className="my-6 text-center">
                          <span className={`font-bold ${plan.price.length > 5 ? "text-3xl" : "text-5xl"}`}>{plan.price}</span>
                          {plan.period && (
                            <span className="ml-1 text-muted-foreground">
                              {plan.period}
                            </span>
                          )}
                        </div>
                      )}

                      <ul className="flex-1 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-base"
                          >
                            <Check className="h-5 w-5 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.familyOptions && showFamilyOptions && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-1.5">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Odaberite paket</p>
                          {plan.familyOptions.map((opt, i) => (
                            <Link key={opt.label} href="/prijava?tab=register">
                              <div className="flex items-center justify-between text-base gap-2 p-2 rounded-md hover-elevate cursor-pointer" data-testid={`link-family-option-${i}`}>
                                <span>{opt.label}</span>
                                <span className="font-semibold whitespace-nowrap">{opt.price}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="mt-8">
                        {plan.familyOptions ? (
                          showFamilyOptions ? null : (
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => setShowFamilyOptions(true)}
                              data-testid={`button-pricing-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {plan.cta}
                            </Button>
                          )
                        ) : (
                          <Link href={plan.href}>
                            <Button
                              className="w-full"
                              variant={plan.featured ? "default" : "outline"}
                              data-testid={`button-pricing-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {plan.cta}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
