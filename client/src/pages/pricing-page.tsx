import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Star, Users, School, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const plans = [
  {
    name: "Čitatelj",
    price: "0 KM",
    period: "/zauvijek",
    description: "Idealno za male čitaoce koji tek počinju.",
    icon: Star,
    features: [
      "Pristup javnoj biblioteci",
      "Rješavanje kvizova",
      "Sakupljanje bodova",
      "Prisustvo na tabeli",
    ],
    buttonText: "Započni besplatno",
    variant: "outline",
  },
  {
    name: "Čitatelj Pro",
    price: "10 KM",
    period: "/godišnje",
    description: "Za strastvene čitaoce koji žele više.",
    icon: Sparkles,
    features: [
      "Sve iz besplatnog paketa",
      "Digitalne diplome za postignuća",
      "Detaljna analitika čitanja",
      "Prioritetna podrška",
    ],
    buttonText: "Pređi na Pro",
    variant: "default",
    popular: true,
  },
  {
    name: "Porodica",
    price: "Od 15 KM",
    period: "/godišnje",
    description: "Zajedničko čitanje i takmičenje.",
    icon: Users,
    features: [
      "Više povezanih računa",
      "Roditeljski nadzor",
      "Porodična rang lista",
      "Prilagođeni izazovi",
    ],
    buttonText: "Odaberi porodični paket",
    variant: "outline",
  },
  {
    name: "Ustanova",
    price: "Po dogovoru",
    period: "",
    description: "Za škole, mektebe i biblioteke.",
    icon: School,
    features: [
      "Neograničen broj učenika",
      "Upravljanje nastavnim kadrom",
      "Izvještaji za razrede",
      "Institucionalna podrška",
    ],
    buttonText: "Kontaktiraj nas",
    variant: "outline",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pronađite plan za sebe</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Odaberite paket koji najbolje odgovara vašim potrebama i započnite čitalačku avanturu već danas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              variants={fadeIn}
            >
              <Card className={`h-full flex flex-col hover-elevate relative ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Najpopularnije
                  </div>
                )}
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={plan.variant as any} className="w-full h-11" asChild>
                    <Link href={plan.name === "Ustanova" ? "/kontakt" : "/registracija"}>
                      {plan.buttonText}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-3xl bg-primary/5 border border-primary/10 text-center">
          <h2 className="text-2xl font-bold mb-4 font-comic">Potrebna vam je prilagođena ponuda?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Ako ste velika institucija ili imate specifične zahtjeve, naš tim će kreirati paket po vašoj mjeri.
          </p>
          <Button size="lg" className="rounded-full px-10 h-12" asChild>
            <Link href="/kontakt">Razgovarajmo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
