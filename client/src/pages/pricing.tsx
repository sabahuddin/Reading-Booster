import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
    name: "Besplatni",
    price: "0",
    period: "kn/mj",
    description: "Savršen za početak",
    features: [
      "5 knjiga",
      "5 kvizova",
      "Osnovne statistike",
    ],
    cta: "Započni besplatno",
    featured: false,
  },
  {
    name: "Premium",
    price: "49",
    period: "kn/mj",
    description: "Za ozbiljne čitatelje",
    features: [
      "Sve knjige",
      "Neograničeni kvizovi",
      "Detaljne statistike",
      "Praćenje napretka",
    ],
    cta: "Odaberi Premium",
    featured: true,
  },
  {
    name: "Škola",
    price: "199",
    period: "kn/mj",
    description: "Za obrazovne ustanove",
    features: [
      "Sve iz Premium",
      "Admin panel",
      "Upravljanje razredima",
      "Izvještaji za roditelje",
    ],
    cta: "Kontaktiraj nas",
    featured: false,
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
              Cijene
            </h1>
            <p className="mt-4 text-muted-foreground">
              Odaberite paket koji najbolje odgovara vašim potrebama
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
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
                  data-testid={`card-pricing-${plan.name.toLowerCase()}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge data-testid="badge-popular">
                        Najpopularniji
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
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

                    <div className="mt-8">
                      <Link
                        href={
                          plan.name === "Škola"
                            ? "/kontakt"
                            : "/registracija"
                        }
                      >
                        <Button
                          className="w-full"
                          variant={plan.featured ? "default" : "outline"}
                          data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
