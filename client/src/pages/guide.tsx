import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, School as SchoolIcon } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-primary/5 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Dobrodošli na Čitanje</h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Čitanje je više od obične web stranice. To je digitalni most između dječije mašte i fizičke knjige. 
              Naš cilj je vratiti radost čitanja u svakodnevnicu kroz igru, takmičenje i zajednički uspjeh.
            </p>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="max-w-5xl mx-auto px-4 mt-16">
        <Tabs defaultValue="student" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted rounded-xl">
            <TabsTrigger value="student" className="py-3 px-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Učenik
            </TabsTrigger>
            <TabsTrigger value="parent" className="py-3 px-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Roditelj
            </TabsTrigger>
            <TabsTrigger value="teacher" className="py-3 px-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Učitelj
            </TabsTrigger>
            <TabsTrigger value="school" className="py-3 px-4 flex items-center gap-2">
              <SchoolIcon className="w-4 h-4" /> Škola
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  Korisnički vodič za učenike
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">Postani kralj ili kraljica čitanja u nekoliko koraka!</p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                    <p><strong>Pronađi knjigu:</strong> Pretraži našu online biblioteku i pronađi knjigu koja ti se sviđa.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                    <p><strong>Pročitaj je:</strong> Uzmi pravu, fizičku knjigu iz svoje školske biblioteke ili je kupi i uživaj u čitanju.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                    <p><strong>Riješi kviz:</strong> Kada pročitaš knjigu, vrati se ovdje i pokaži svoje znanje kroz kratki kviz.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                    <p><strong>Sakupljaj bodove:</strong> Svaki tačan odgovor donosi ti bodove koji te penju na tabeli najboljih čitalaca!</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parent">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  Korisnički vodič za roditelje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">Budite podrška svom djetetu na putu znanja.</p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                    <p><strong>Pratite napredak:</strong> Vidite koje knjige vaše dijete čita i kakve rezultate postiže na kvizovima.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                    <p><strong>Porodično takmičenje:</strong> Registrujte svoj račun u kategoriji "Odrasli" i takmičite se ko će više pročitati!</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                    <p><strong>Povezivanje:</strong> Ako je dijete dobilo račun u školi, jednostavno ga povežite sa svojim profilom.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  Korisnički vodič za učitelje i muallime
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">Pretvorite lektiru u najdraži čas.</p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                    <p><strong>Upravljanje razredom:</strong> Kreirajte račune za sve svoje učenike jednim klikom.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                    <p><strong>Analitika:</strong> Pratite prosjek bodova razreda i identifikujte učenike kojima je potrebna dodatna motivacija.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                    <p><strong>Izazovi:</strong> Kreirajte sedmične izazove (npr. 'Ko će pročitati ovu knjigu do petka?') i dodijelite bonus bodove.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="school">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <SchoolIcon className="w-8 h-8 text-primary" />
                  Vodič za škole i medžlise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">Sistemsko rješenje za promociju pismenosti.</p>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6">
                  <h4 className="font-bold text-orange-900 mb-2">Napredno upravljanje (Škola Admin)</h4>
                  <p className="text-orange-800">
                    Kao institucionalni administrator (Škola ili Medžlis), imate uvid u cijeli kolektiv. Možete kreirati 
                    stotine učeničkih računa, dodijeliti nastavnike ili muallime njihovim grupama i pratiti 
                    ukupnu statistiku čitanja na nivou cijele ustanove.
                  </p>
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                    <p><strong>Centralizacija:</strong> Svi nastavnici i svi učenici na jednom pregledu.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                    <p><strong>Masovni import:</strong> Jednostavno dodajte nastavni kadar i rasporedite ih po odjeljenjima.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                    <p><strong>Monitoring:</strong> Analizirajte trendove čitanja kroz mjesece i nagradite najaktivnija odjeljenja.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Contribution Section */}
      <section className="max-w-4xl mx-auto px-4 mt-24 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Postani dio naše priče</h2>
          <p className="text-xl text-orange-50 mb-8">
            Čitanje je projekat koji raste uz vašu pomoć. Podržite nas kroz sponzorstva nagrada ili jednostavno podijelite našu misiju sa drugima.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg" className="rounded-full px-8" asChild>
              <Link href="/kontakt">Postani sponzor</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 bg-white/10 border-white/20 hover:bg-white/20" asChild>
              <Link href="/kontakt">Podijeli sadržaj</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
