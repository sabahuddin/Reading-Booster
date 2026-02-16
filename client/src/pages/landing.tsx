import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Brain, TrendingUp, Users, UserPlus, BookText, ClipboardCheck, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: BookOpen,
    title: "Puno knjiga",
    description:
      "Istraži našu veliku biblioteku punu zanimljivih knjiga za tvoj uzrast!",
  },
  {
    icon: Brain,
    title: "Zabavni kvizovi",
    description:
      "Nakon čitanja, riješi kviz i pokaži koliko si naučio. Svaki točan odgovor donosi bodove!",
  },
  {
    icon: TrendingUp,
    title: "Prati svoj napredak",
    description:
      "Gledaj kako tvoji bodovi rastu! Prati koliko si knjiga pročitao i kvizova riješio.",
  },
  {
    icon: Users,
    title: "Zajedno učimo",
    description:
      "Tvoji učitelji i roditelji mogu pratiti tvoj napredak i pomoći ti da postaneš bolji čitač!",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Registriraj se",
    description: "Napravi svoj račun brzo i lako - treba ti samo par klikova!",
  },
  {
    icon: BookText,
    step: "2",
    title: "Čitaj knjige",
    description: "Odaberi knjigu koja ti se sviđa i uživaj u čitanju!",
  },
  {
    icon: ClipboardCheck,
    step: "3",
    title: "Riješi kviz",
    description: "Pokaži koliko si zapamtio i osvoji bodove!",
  },
];

const stats = [
  { value: "500+", label: "knjiga" },
  { value: "10,000+", label: "učenika" },
  { value: "1,000+", label: "kvizova" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(262,80%,55%)] via-[hsl(280,70%,45%)] to-[hsl(310,65%,40%)]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:py-40">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-14 w-14 sm:h-16 sm:w-16 text-white/90" />
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-300" />
            </div>
            <h1
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              data-testid="text-hero-title"
            >
              Čitaj, uči, osvajaj!
            </h1>
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Zabavna platforma za mlade čitatelje! Čitaj knjige, rješavaj kvizove
              i sakupljaj bodove. Tvoja čitalačka avantura počinje ovdje!
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/registracija">
                <Button
                  size="lg"
                  className="bg-white text-[hsl(262,80%,55%)] border-white/80"
                  data-testid="button-cta-register"
                >
                  Kreni u avanturu!
                </Button>
              </Link>
              <Link href="/biblioteka">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white backdrop-blur-sm bg-white/10"
                  data-testid="button-cta-learn-more"
                >
                  Pogledaj knjige
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-3xl font-bold sm:text-4xl"
              data-testid="text-features-title"
            >
              Zašto je Čitaj! super?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Pogledaj što te sve čeka!
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full" data-testid={`card-feature-${index}`}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-3xl font-bold sm:text-4xl"
              data-testid="text-how-it-works-title"
            >
              Kako početi?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Super lako - samo tri koraka!
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="flex flex-col items-center text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground border">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="grid grid-cols-1 gap-8 sm:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center"
                data-testid={`stat-${stat.label}`}
              >
                <p className="text-4xl font-bold text-primary sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-lg text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[hsl(262,80%,55%)] to-[hsl(310,65%,40%)]">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-300" />
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white/80" />
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Spreman za avanturu?
            </h2>
            <p className="mt-4 text-white/90">
              Pridruži se tisućama učenika koji već čitaju i osvajaju bodove!
            </p>
            <div className="mt-8">
              <Link href="/registracija">
                <Button
                  size="lg"
                  className="bg-white text-[hsl(262,80%,55%)] border-white/80"
                  data-testid="button-cta-bottom-register"
                >
                  Započni besplatno
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
