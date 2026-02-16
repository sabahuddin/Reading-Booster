import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Brain, TrendingUp, Users, UserPlus, BookText, ClipboardCheck, Sparkles, Rocket, Trophy, Medal, Award, Calendar, Gift, ExternalLink, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { Partner, Challenge } from "@shared/schema";

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

interface TopReader {
  userId: string;
  username: string;
  fullName: string;
  totalScore: number;
}

function TopReadersSection() {
  const [period, setPeriod] = useState("week");

  const { data: readers } = useQuery<TopReader[]>({
    queryKey: ["/api/leaderboard", period],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?period=${period}`);
      return res.json();
    },
  });

  const periodLabels: Record<string, string> = {
    week: "Čitatelj sedmice",
    month: "Čitatelj mjeseca",
    year: "Čitatelj godine",
  };

  const medalIcons = [
    <Medal className="h-5 w-5 text-yellow-500" />,
    <Medal className="h-5 w-5 text-gray-400" />,
    <Medal className="h-5 w-5 text-amber-700" />,
  ];

  return (
    <section className="py-20 bg-card">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl" data-testid="text-leaderboard-title">
            Najbolji čitatelji
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Pogledaj ko najviše čita!
          </p>
        </motion.div>

        <div className="mt-8 max-w-2xl mx-auto">
          <Tabs value={period} onValueChange={setPeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-3" data-testid="tabs-leaderboard">
              <TabsTrigger value="week" data-testid="tab-leaderboard-week">Sedmica</TabsTrigger>
              <TabsTrigger value="month" data-testid="tab-leaderboard-month">Mjesec</TabsTrigger>
              <TabsTrigger value="year" data-testid="tab-leaderboard-year">Godina</TabsTrigger>
            </TabsList>
            <TabsContent value={period}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-center">{periodLabels[period]}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!readers || readers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">
                      Još nema rezultata za ovaj period.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {readers.map((reader, index) => (
                        <div
                          key={reader.userId}
                          className={`flex items-center gap-3 p-3 rounded-md ${
                            index === 0
                              ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900"
                              : index === 1
                              ? "bg-gray-50 dark:bg-gray-900/20"
                              : index === 2
                              ? "bg-amber-50 dark:bg-amber-950/20"
                              : ""
                          }`}
                          data-testid={`row-reader-${index}`}
                        >
                          <span className="text-lg font-bold w-8 text-center">
                            {index < 3 ? medalIcons[index] : `${index + 1}.`}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium" data-testid={`text-reader-name-${index}`}>{reader.fullName}</p>
                            <p className="text-sm text-muted-foreground">@{reader.username}</p>
                          </div>
                          <Badge variant="default" className="text-sm" data-testid={`text-reader-score-${index}`}>
                            {reader.totalScore} bodova
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function ChallengesSection() {
  const { data: challengesList } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  if (!challengesList || challengesList.length === 0) return null;

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("bs-BA", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-8 w-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl" data-testid="text-challenges-title">
            Izazovi i nagrade
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Sudjeluj u izazovima i osvoji nagrade!
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {challengesList.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border-2 border-purple-200 dark:border-purple-900" data-testid={`card-challenge-${challenge.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{challenge.description}</p>
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-md">
                    <div className="flex items-center gap-1 mb-2">
                      <Gift className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Nagrade:</p>
                    </div>
                    {challenge.prizes.split("|").map((prize, i) => (
                      <p key={i} className="text-sm text-amber-700 dark:text-amber-300 ml-5">{prize.trim()}</p>
                    ))}
                  </div>
                  <Link href="/registracija">
                    <Button size="sm" variant="outline" className="w-full mt-2" data-testid={`button-join-challenge-${challenge.id}`}>
                      Pridruži se izazovu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnersSection() {
  const { data: partnersList } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  if (!partnersList || partnersList.length === 0) return null;

  return (
    <section className="py-16 bg-card">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Handshake className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl" data-testid="text-partners-title">
            Naši partneri
          </h2>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          {partnersList.map((partner) => (
            <motion.div
              key={partner.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2"
              data-testid={`partner-item-${partner.id}`}
            >
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="h-16 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-muted-foreground">{partner.name}</span>
                </a>
              ) : (
                <>
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="h-16 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-muted-foreground">{partner.name}</span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

      <TopReadersSection />

      <ChallengesSection />

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

      <PartnersSection />

      <Footer />
    </div>
  );
}
