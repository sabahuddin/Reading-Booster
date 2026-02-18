import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Brain, TrendingUp, Users, UserPlus, BookText, ClipboardCheck, Sparkles, Rocket, Trophy, Medal, Award, Calendar, Gift, ExternalLink, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { Partner, Challenge } from "@shared/schema";
import heroBg from "@assets/background_1771243573729.png";
import kidsReadingImg from "@assets/ChatGPT_Image_17._feb_2026._u_20_56_38_1771358489681.png";
import bookIconImg from "@assets/book_icon_1771363420815.png";
import iLoveReadingImg from "@assets/i_love_reading_1771429877371.png";

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
      "Nakon čitanja, riješi kviz i pokaži koliko si naučio. Svaki tačan odgovor donosi bodove!",
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
      "Tvoji učitelji i roditelji mogu pratiti tvoj napredak i pomoći ti da postaneš bolji čitalac!",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Registriraj se",
    description: "Napravi svoj račun brzo i lahko - treba ti samo par klikova!",
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


interface TopReader {
  userId: string;
  username: string;
  fullName: string;
  totalScore: number;
}

function LeaderboardTable({ period, ageGroup }: { period: string; ageGroup: string }) {
  const endpoint = ageGroup === "A"
    ? `/api/leaderboard?period=${period}&ageGroup=A`
    : `/api/leaderboard?period=${period}&ageGroup=MDO`;



  const { data: leaderboard = [] } = useQuery<any[]>({
    queryKey: [endpoint],
  });

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Nema podataka za ovaj period
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rang</TableHead>
              <TableHead>Korisničko ime</TableHead>
              {ageGroup !== "A" && <TableHead>Razred</TableHead>}
              <TableHead className="text-right">Bodovi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((user: any, index: number) => (
              <TableRow key={user.userId || user.id || index}>
                <TableCell>
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                {ageGroup !== "A" && <TableCell>{user.className}</TableCell>}
                <TableCell className="text-right">{user.totalScore || user.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TopReadersSection() {
  const [period, setPeriod] = useState("week");
  const { scrollY } = useScroll();
  const yTrophy = useTransform(scrollY, [400, 1500], [-200, 200]);

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Background Illustration Paralax */}
      <motion.div 
        style={{ y: yTrophy }}
        className="absolute top-1/2 -translate-y-1/2 -right-48 w-[1024px] h-[1024px] opacity-10 pointer-events-none hidden lg:block"
      >
        <img src={bookIconImg} alt="" className="w-full h-full object-contain" />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 relative z-10">
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
            Top čitaoci
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Pogledaj ko najviše čita!
          </p>
        </motion.div>

        <div className="mt-8 max-w-4xl mx-auto">
          <Tabs defaultValue="djeca" className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="tabs-leaderboard-age">
              <TabsTrigger value="djeca" data-testid="tab-leaderboard-djeca">Djeca</TabsTrigger>
              <TabsTrigger value="odrasli" data-testid="tab-leaderboard-odrasli">Odrasli</TabsTrigger>
            </TabsList>

            <TabsContent value="djeca">
              <LeaderboardTable period={period} ageGroup="MDO" />
            </TabsContent>

            <TabsContent value="odrasli">
              <LeaderboardTable period={period} ageGroup="A" />
            </TabsContent>
          </Tabs>

          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant={period === "week" ? "default" : "outline"}
              onClick={() => setPeriod("week")}
              data-testid="button-period-week"
            >
              Sedmica
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              onClick={() => setPeriod("month")}
              data-testid="button-period-month"
            >
              Mjesec
            </Button>
            <Button
              variant={period === "year" ? "default" : "outline"}
              onClick={() => setPeriod("year")}
              data-testid="button-period-year"
            >
              Godina
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChallengesSection() {
  const { data: challengesList } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });
  const hasChallenges = challengesList && challengesList.length > 0;

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("bs-BA", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background "I love reading" illustration */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src={iLoveReadingImg} 
          alt="" 
          className="w-full h-full object-cover opacity-[0.15]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl" data-testid="text-challenges-title">
            Izazovi i nagrade
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Učestvuj u izazovima i osvoji nagrade!
          </p>
        </motion.div>

        {hasChallenges ? (
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
                <Card className="h-full border-2 border-orange-200 dark:border-orange-900" data-testid={`card-challenge-${challenge.id}`}>
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
                      {challenge.prizes.split("|").map((prize: string, i: number) => (
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
        ) : (
          <motion.div
            className="mt-10 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted-foreground">Uskoro objavljujemo nove izazove. Ostanite s nama!</p>
            <Link href="/registracija">
              <Button size="lg" className="mt-6" data-testid="button-register-challenges">
                Registriraj se i budi prvi
              </Button>
            </Link>
          </motion.div>
        )}
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

function AboutSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="space-y-12"
        >
          {/* Q&A Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Često postavljana pitanja</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>
            
            <div className="grid gap-6">
              <div className="p-6 rounded-xl border-2 border-orange-100 bg-orange-50/30">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Zašto Čitanje?</h3>
                <p className="text-muted-foreground">U digitalnom dobu, motivacija za čitanje fizičkih knjiga opada. Naša platforma koristi elemente igre (gamification) kako bi čitanje ponovo postalo uzbudljiva avantura za djecu i mlade.</p>
              </div>
              
              <div className="p-6 rounded-xl border-2 border-orange-100 bg-orange-50/30">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Treba li nam ovo?</h3>
                <p className="text-muted-foreground">Da, jer čitanje razvija empatiju, vokabular i kritičko razmišljanje. Čitanje.ba premošćuje jaz između ekrana i papira, čineći svaku pročitanu stranicu vrijednom bodova i priznanja.</p>
              </div>
              
              <div className="p-6 rounded-xl border-2 border-orange-100 bg-orange-50/30">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Koji je cilj?</h3>
                <p className="text-muted-foreground">Naš cilj je stvoriti zajednicu čitalaca, povezati škole i porodice, te kroz pozitivno takmičenje podići nivo pismenosti i ljubavi prema knjizi na našem govornom području.</p>
              </div>
              
              <div className="p-6 rounded-xl border-2 border-orange-100 bg-orange-50/30">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Kako to uraditi?</h3>
                <p className="text-muted-foreground">Jednostavno: odaberi knjigu iz biblioteke, pročitaj je u fizičkom formatu, vrati se na platformu da riješiš kviz, osvoji bodove i prati svoj rang na tabeli najboljih čitalaca!</p>
              </div>
            </div>
          </div>

          {/* Guide & Scenarios */}
          <div className="space-y-8 pt-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Vodič i scenariji korištenja</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">1</div>
                <div>
                  <h4 className="font-bold text-xl mb-1">Scenarij za škole</h4>
                  <p className="text-muted-foreground">Učitelji kreiraju razrede i prate napredak učenika. Čitanje lektire postaje interaktivno, a najbolji čitaoci u razredu dobijaju digitalna i stvarna priznanja.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">2</div>
                <div>
                  <h4 className="font-bold text-xl mb-1">Porodično takmičenje</h4>
                  <p className="text-muted-foreground">Roditelji se mogu registrovati, povezati sa svojom djecom i zajedno učestvovati u izazovima. Takmičite se ko će sakupiti više bodova kroz Beletristiku i Islam module!</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">3</div>
                <div>
                  <h4 className="font-bold text-xl mb-1">Islamski modul</h4>
                  <p className="text-muted-foreground">Poseban fokus na islamsku literaturu omogućava učiteljima da motivišu učenike na čitanje priča o poslanicima i islamske historije uz zabavne kvizove.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center shadow-xl" id="kontakt-sekcija">
            <h2 className="text-2xl font-bold mb-4">Postani dio naše priče</h2>
            <p className="text-orange-50 mb-6 text-lg">
              Čitanje je projekat zajednice. Možete doprinijeti razvoju platforme kroz <strong>sponzorstva nagrada</strong> za najuspješnije čitaoce ili jednostavno <strong>dijeljenjem sadržaja</strong> i pozivanjem prijatelja da nam se pridruže.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/kontakt">Kontaktiraj nas</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const yKidsHero = useTransform(scrollY, [0, 800], [0, -200]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-[rgba(210,105,10,0.85)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:py-40">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center justify-center mb-2">
              <img src={bookIconImg} alt="" className="h-32 w-auto opacity-90" />
            </div>
            <h1
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              data-testid="text-hero-title"
            >
              Čitaj, uči, osvajaj!
            </h1>
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Zabavna platforma za mlade čitaoce! Čitaj knjige, rješavaj kvizove
              i sakupljaj bodove. Tvoja čitalačka avantura počinje ovdje!
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/registracija">
                <Button
                  size="lg"
                  className="bg-white text-[hsl(24,85%,40%)] border-white/80"
                  data-testid="button-cta-register"
                >
                  Kreni u avanturu!
                </Button>
              </Link>
              <a href="/biblioteka">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white backdrop-blur-sm bg-white/10 border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white/20"
                  data-testid="button-cta-learn-more"
                >
                  Pogledaj knjige
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        {/* Background Illustration Paralax */}
        <motion.div 
          style={{ y: yKidsHero }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        >
          <img 
            src={kidsReadingImg} 
            alt="" 
            className="w-[900px] h-[900px] object-contain opacity-[0.15]"
            style={{ 
              maskImage: "radial-gradient(ellipse 60% 60% at center, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 60% at center, black 30%, transparent 75%)"
            }}
          />
        </motion.div>
        <div className="mx-auto max-w-7xl px-4 relative z-10">
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
              Zašto je Čitanje super?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Pogledaj šta te sve čeka!
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
              Super lahko - samo tri koraka!
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
            className="grid grid-cols-1 gap-8 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/10">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Bogata biblioteka</h3>
              <p className="text-muted-foreground">Stotine naslova prilagođenih svim uzrastima i interesovanjima.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/10">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Zajednica čitalaca</h3>
              <p className="text-muted-foreground">Pridruži se vršnjacima, takmiči se i dijeli radost čitanja.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[hsl(28,95%,45%)]" id="kontakt-sekcija">
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
              Pridruži se hiljadama učenika koji već čitaju i osvajaju bodove!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/registracija">
                <Button
                  size="lg"
                  className="bg-white text-[hsl(24,85%,40%)] border-white/80"
                  data-testid="button-cta-bottom-register"
                >
                  Započni besplatno
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  Kontaktiraj nas
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
