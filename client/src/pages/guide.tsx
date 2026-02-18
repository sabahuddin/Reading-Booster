import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Users, GraduationCap, School as SchoolIcon,
  Printer, FileDown, PieChart, TrendingUp, Sparkles,
  Star, Target, Award, Flame, Trophy, Heart
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const mockStudents = [
  { name: "Ahmed Hodžić", points: 145, read: 12, trend: "+3" },
  { name: "Merima Begović", points: 132, read: 10, trend: "+2" },
  { name: "Senad Muratović", points: 118, read: 9, trend: "+1" },
  { name: "Amra Delić", points: 95, read: 7, trend: "+4" },
  { name: "Tarik Suljić", points: 88, read: 6, trend: "0" },
];

function StudentDashboardMock() {
  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
      <div className="bg-white dark:bg-slate-900 border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Čitalačka Ploča</h3>
            <p className="text-xs text-slate-500">Dobrodošli, Ahmed!</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Ukupno bodova</p>
            <Star className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">145</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Kvizova riješeno</p>
            <Target className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">12</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Prosječna tačnost</p>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">87%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Najbolji rezultat</p>
            <Award className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">18</span>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold">Aktivni izazovi</h4>
          </div>
          <div className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800">
            <Trophy className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Pročitaj 5 knjiga u januaru</p>
              <p className="text-[10px] text-slate-500">Nagrade: Diploma najboljeg čitaoca</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold">Biblioteka</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Pregledaj knjige</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold">Moji rezultati</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Pogledaj postignuća</p>
        </div>
      </div>
    </div>
  );
}

function ParentDashboardMock() {
  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
      <div className="bg-white dark:bg-slate-900 border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Roditeljska Ploča</h3>
            <p className="text-xs text-slate-500">Dobrodošli, Jasmina!</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Djece</p>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">2</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Ukupno bodova</p>
            <Star className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-primary">230</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Vaši bodovi</p>
            <Trophy className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">45</span>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase">Vaša djeca</h4>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">A</div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Ahmed</p>
              <p className="text-[10px] text-slate-500">145 bodova</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-[10px]">12 kvizova</Badge>
          </div>
          <div className="flex gap-4 text-[10px] text-slate-500">
            <span>Tačnost: 87%</span>
            <span>Najbolji: 18 bodova</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">D</div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Dina</p>
              <p className="text-[10px] text-slate-500">85 bodova</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-[10px]">8 kvizova</Badge>
          </div>
          <div className="flex gap-4 text-[10px] text-slate-500">
            <span>Tačnost: 92%</span>
            <span>Najbolji: 15 bodova</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboardMock() {
  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
      <div className="bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Učiteljski Panel</h3>
            <p className="text-xs text-slate-500">Dobrodošli nazad, Amra Hodžić</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1 text-[10px] px-2">
            <Printer className="w-3 h-3" /> Print
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-[10px] px-2">
            <FileDown className="w-3 h-3" /> Export
          </Button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ukupno pročitano</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-primary">478</span>
            <span className="text-[10px] text-green-500 font-bold mb-1">+12%</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ovaj mjesec</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">42</span>
            <span className="text-[10px] text-blue-500 font-bold mb-1">Cilj: 50</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Prosjek bodova</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">84.5</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Aktivni izazovi</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">2</span>
          </div>
        </div>
      </div>

      <div className="p-4 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
          <div className="p-3 border-b flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Pregled učenika (V-a)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2 font-bold">Učenik</th>
                  <th className="px-4 py-2 font-bold text-center">Bodovi</th>
                  <th className="px-4 py-2 font-bold text-center">Knjige</th>
                  <th className="px-4 py-2 font-bold text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                        {s.name.charAt(0)}
                      </div>
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold text-primary">{s.points}</td>
                    <td className="px-4 py-2.5 text-center">{s.read}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-green-500">{s.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-4">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Omiljeni žanrovi
            </h4>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="60, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="25, 100" strokeDashoffset="-60" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[10px] font-bold">Lektira</span>
                  <span className="text-[8px] text-slate-500">60%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-4 text-[10px]">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Nedavna aktivnost
            </h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-1 bg-green-400 rounded-full" />
                <div>
                  <p className="font-bold">Ahmed H. je završio kviz</p>
                  <p className="text-slate-500">Družba Pere Kvržice (10/10)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchoolDashboardMock() {
  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
      <div className="bg-white dark:bg-slate-900 border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <SchoolIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">OŠ Silvije Strahimir Kranjčević</h3>
            <p className="text-xs text-slate-500">Statistika ustanove</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Ukupno učenika</p>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">312</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Nastavnici</p>
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">14</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Riješeno kvizova</p>
            <Target className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-primary">1,247</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">Prosječni bodovi</p>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">42.3</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
          <div className="p-3 border-b">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Top 5 učenika
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2 font-bold">#</th>
                  <th className="px-4 py-2 font-bold">Čitalac</th>
                  <th className="px-4 py-2 font-bold text-center">Razred</th>
                  <th className="px-4 py-2 font-bold text-right">Bodovi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { name: "Ahmed Hodžić", class: "V-a", points: 145 },
                  { name: "Merima Begović", class: "IV-b", points: 132 },
                  { name: "Senad Muratović", class: "VI-a", points: 118 },
                  { name: "Amra Delić", class: "V-a", points: 95 },
                  { name: "Tarik Suljić", class: "III-a", points: 88 },
                ].map((s, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-bold text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{s.name}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant="secondary" className="text-[10px]">{s.class}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-primary">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">
        <section className="relative py-24 bg-primary/5 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Dobrodošli na Čitanje</h1>
              <p className="text-2xl text-muted-foreground leading-relaxed mb-8">
                Čitanje je više od obične web stranice. To je digitalni most između dječije mašte i fizičke knjige. 
                Naš cilj je vratiti radost čitanja u svakodnevnicu kroz igru, takmičenje i zajednički uspjeh.
              </p>
              <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
            </motion.div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 mt-16">
          <Tabs defaultValue="citalac" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted rounded-xl">
              <TabsTrigger value="citalac" className="py-3 px-4 flex items-center gap-2" data-testid="tab-guide-citalac">
                <BookOpen className="w-5 h-5" /> Čitalac
              </TabsTrigger>
              <TabsTrigger value="parent" className="py-3 px-4 flex items-center gap-2" data-testid="tab-guide-parent">
                <Users className="w-5 h-5" /> Roditelj
              </TabsTrigger>
              <TabsTrigger value="teacher" className="py-3 px-4 flex items-center gap-2" data-testid="tab-guide-teacher">
                <GraduationCap className="w-5 h-5" /> Učitelj
              </TabsTrigger>
              <TabsTrigger value="school" className="py-3 px-4 flex items-center gap-2" data-testid="tab-guide-school">
                <SchoolIcon className="w-5 h-5" /> Škola
              </TabsTrigger>
            </TabsList>

            <TabsContent value="citalac">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <BookOpen className="w-10 h-10 text-primary" />
                    Vodič za čitaoce
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <p className="text-xl text-muted-foreground">Postani kralj ili kraljica čitanja u nekoliko koraka!</p>
                        <ul className="space-y-4">
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                            <p><strong>Pronađi knjigu:</strong> Pretraži našu online biblioteku i pronađi knjigu koja ti se sviđa.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                            <p><strong>Pročitaj je:</strong> Uzmi pravu, fizičku knjigu iz svoje školske biblioteke ili je kupi i uživaj u čitanju.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                            <p><strong>Riješi kviz:</strong> Kada pročitaš knjigu, vrati se ovdje i pokaži svoje znanje kroz kratki kviz.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                            <p><strong>Sakupljaj bodove:</strong> Svaki tačan odgovor donosi ti bodove koji te penju na tabeli najboljih čitalaca!</p>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                          <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Savjet
                          </h4>
                          <p className="text-base text-amber-800 dark:text-amber-200">
                            Registruj se besplatno kao Čitalac i odmah počni sa čitanjem! Ako te učitelj/ica već registrovala, koristi podatke koje si dobio/la.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Tvoja čitalačka ploča</h4>
                      <StudentDashboardMock />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parent">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <Users className="w-10 h-10 text-primary" />
                    Vodič za roditelje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <p className="text-xl text-muted-foreground font-medium">Budite podrška svom djetetu na putu znanja.</p>
                        <ul className="space-y-4">
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                            <p><strong>Pratite napredak:</strong> Vidite koje knjige vaše dijete čita i kakve rezultate postiže na kvizovima.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                            <p><strong>Porodično takmičenje:</strong> Registrujte svoj račun u kategoriji "Odrasli" i takmičite se ko će više pročitati!</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                            <p><strong>Povezivanje:</strong> Ako je dijete dobilo račun u školi, jednostavno ga povežite sa svojim profilom.</p>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                          <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Savjet za roditelje
                          </h4>
                          <p className="text-base text-amber-800 dark:text-amber-200">
                            Odaberite porodični paket i takmičite se zajedno sa djecom. Čitanje postaje zajednička porodična aktivnost!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Roditeljska ploča</h4>
                      <ParentDashboardMock />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teacher">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <GraduationCap className="w-10 h-10 text-primary" />
                    Vodič za učitelje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <p className="text-xl text-muted-foreground font-medium">Pretvorite lektiru u najdraži čas.</p>
                        <ul className="space-y-4">
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                            <p><strong>Analitika i Praćenje:</strong> Pratite broj pročitanih knjiga (ukupno i mjesečno), prosjek bodova po učeniku i trendove rasta.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                            <p><strong>Izvještaji:</strong> Jednim klikom generišite PDF izvještaj za cijeli razred ili eksportujte podatke u Excel format.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                            <p><strong>Motivacija:</strong> Kreirajte izazove, dodjeljujte značke i bonus bodove za najvrednije čitaoce.</p>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                          <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Savjet za rad
                          </h4>
                          <p className="text-base text-amber-800 dark:text-amber-200">
                            Koristite "Print" opciju prije roditeljskog sastanka kako biste svakom roditelju uručili detaljan pregled čitalačkih navika njihovog djeteta.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Interaktivni prikaz panela</h4>
                      <TeacherDashboardMock />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="school">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <SchoolIcon className="w-10 h-10 text-primary" />
                    Vodič za škole
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <p className="text-xl text-muted-foreground font-medium">Sistemsko rješenje za promociju pismenosti.</p>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mb-4">
                          <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-1 text-sm">Napredno upravljanje</h4>
                          <p className="text-orange-800 dark:text-orange-200 text-sm">
                            Kao institucionalni administrator, imate uvid u cijeli kolektiv, kreirate stotine računa i pratite statistiku na nivou ustanove.
                          </p>
                        </div>
                        <ul className="space-y-4">
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                            <p><strong>Centralizacija:</strong> Svi nastavnici i svi učenici na jednom pregledu.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                            <p><strong>Monitoring:</strong> Analizirajte trendove čitanja kroz mjesece.</p>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                          <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Za direktore
                          </h4>
                          <p className="text-base text-amber-800 dark:text-amber-200">
                            Registrujte svoju školu kroz tab "Škola" na stranici za prijavu. Administrator će odobriti vaš zahtjev i dobićete pristup svim alatima.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Prikaz školskog panela</h4>
                      <SchoolDashboardMock />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

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
              <Button variant="outline" size="lg" className="rounded-full px-8 bg-white/10 border-white/20" asChild>
                <Link href="/kontakt">Podijeli sadržaj</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
