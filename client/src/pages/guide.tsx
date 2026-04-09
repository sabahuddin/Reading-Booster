import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Users, GraduationCap, School as SchoolIcon,
  Printer, FileDown, PieChart, TrendingUp, Sparkles,
  Star, Target, Award, Flame, Trophy, Heart,
  Swords, Store, ShieldCheck, Lock, Trash2, BarChart2, Medal,
  Bookmark, Bell, FileText, CalendarCheck, PenLine, CheckCircle2, Globe
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Moja čitaonica</h3>
            <p className="text-xs text-slate-500">Dobrodošli, Ahmed!</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-1 rounded-full text-[10px] font-bold">
              <Flame className="w-3 h-3" /> 4 sedmice
            </div>
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
            <p className="text-[10px] uppercase font-bold text-slate-500">Certifikata</p>
            <Award className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-primary">8</span>
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
              <p className="text-xs font-medium">Pročitaj 5 knjiga u aprilu</p>
              <p className="text-[10px] text-slate-500">Nagrada: Diploma najboljeg čitaoca</p>
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
          <p className="text-[10px] text-slate-500 mt-1">Pregledaj i označi knjige</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold">Moji certifikati</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Preuzmi potvrde o čitanju</p>
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Roditeljski pregled</h3>
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
              <p className="text-[10px] text-slate-500">145 bodova · 8 certifikata</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-[10px]">12 kvizova</Badge>
          </div>
          <div className="flex gap-4 text-[10px] text-slate-500">
            <span>Tačnost: 87%</span>
            <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" /> 4 sedmice streak</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">D</div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Dina</p>
              <p className="text-[10px] text-slate-500">85 bodova · 5 certifikata</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-[10px]">8 kvizova</Badge>
          </div>
          <div className="flex gap-4 text-[10px] text-slate-500">
            <span>Tačnost: 92%</span>
            <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" /> 2 sedmice streak</span>
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Učiteljski pregled</h3>
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
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Na čekanju</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-amber-500">1</span>
            <span className="text-[10px] text-slate-500 mb-1">kviz izmjena</span>
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100">OŠ Ćamil Sijarić</h3>
            <p className="text-xs text-slate-500">Statistika škole</p>
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

        {/* Hero sekcija */}
        <section className="relative py-24 bg-primary/5 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
              <Badge className="text-sm px-4 py-1.5 rounded-full">Vodič kroz platformu</Badge>
              <h1 className="text-5xl md:text-6xl font-bold">Čitanje.ba</h1>
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Digitalni most između knjige i djeteta. Platforma koja pretvara svaku pročitanu knjigu u bodove, certifikate i zajedničko takmičenje — za učenike, roditelje, učitelje i škole.
              </p>
              <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
            </motion.div>
          </div>
        </section>

        {/* Šta je Čitanje.ba */}
        <section className="max-w-5xl mx-auto px-4 mt-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-3xl font-bold text-center mb-10">Kako funkcioniše platforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-2xl border bg-card text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">1. Odaberi i pročitaj</h3>
                <p className="text-sm text-muted-foreground">Pronađi knjige u biblioteci filtriranim prema tvojoj dobi. Uzmi fizičku kopiju i pročitaj je. Platforma prati stvarno čitanje — bez e-knjiga.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">2. Riješi kviz</h3>
                <p className="text-sm text-muted-foreground">Dokaži da si pročitao/la knjigu rješavanjem randomiziranog kviza s timerom. Svaka starosna grupa ima drugačiji broj pitanja i bodova.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">3. Sakupljaj nagrade</h3>
                <p className="text-sm text-muted-foreground">Svaki položen kviz donosi bodove, certifikat i napredak ka višem nivou. Takmič se na rang-listi, osvajaj značke i prihvataj dvoboje.</p>
              </div>
            </div>
          </motion.div>

          {/* Sistem bodovanja */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mb-16">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Sistem bodova i starosnih grupa</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { group: "R1", label: "1.–3. razred", points: "2 boda/pit.", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200", questions: "10 pitanja" },
                  { group: "R4", label: "4.–6. razred", points: "3 boda/pit.", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200", questions: "15 pitanja" },
                  { group: "R7", label: "7.–9. razred", points: "5 bodova/pit.", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200", questions: "20 pitanja" },
                  { group: "O", label: "Omladina 15–18", points: "7 bodova/pit.", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200", questions: "20 pitanja" },
                  { group: "A", label: "Odrasli 18+", points: "10 bodova/pit.", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200", questions: "20 pitanja" },
                ].map(g => (
                  <div key={g.group} className={`p-4 rounded-xl text-center ${g.color}`}>
                    <div className="text-2xl font-black mb-1">{g.group}</div>
                    <div className="text-xs font-bold mb-2">{g.label}</div>
                    <div className="text-xs font-semibold">{g.points}</div>
                    <div className="text-[10px] opacity-70 mt-1">{g.questions}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Napomena:</strong> R1 djeca nikad ne gube bodove za pogrešan odgovor. Za sve starije grupe, netačni odgovori umanjuju konačni rezultat. Prolaz je na 40% (R1) odnosno 50% (R4+). Pali kviz → 48h čekanje, položen kviz → ne može se ponavljati.
              </p>
            </div>
          </motion.div>

          {/* Tabovi po ulogama */}
          <Tabs defaultValue="citalac" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted rounded-xl">
              <TabsTrigger value="citalac" className="py-3 px-4 flex items-center gap-2" data-testid="tab-guide-citalac">
                <BookOpen className="w-5 h-5" /> Čitalac / Učenik
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

            {/* TAB: ČITALAC / UČENIK */}
            <TabsContent value="citalac">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <BookOpen className="w-10 h-10 text-primary" />
                    Vodič za čitaoce i učenike
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Učenici dobivaju račun od učitelja ili roditelja. Čitaoci (18+) se registruju samostalno. Obje uloge imaju pristup istim funkcijama čitanja.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <p className="text-xl text-muted-foreground font-medium">Postani kralj ili kraljica čitanja u nekoliko koraka!</p>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                          <p><strong>Pronađi knjigu:</strong> Pretraži biblioteku od skoro 2.000 naslova filtriranih prema tvojoj dobi i žanru. Označi knjige koje hoćeš pročitati.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                          <p><strong>Pročitaj je:</strong> Uzmi fizičku knjigu iz biblioteke ili kupi je. Nema e-knjiga — poanta je pravo čitanje!</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                          <p><strong>Riješi kviz:</strong> Timer od 30 sekundi po pitanju. Pitanja se svaki put randomiziraju. Teže knjige donose više bodova.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                          <p><strong>Preuzmi certifikat:</strong> Svaki položeni kviz generiše digitalni certifikat koji možeš printati i uručiti svom nastavniku.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">5</span>
                          <p><strong>Sakupljaj bodove i značke:</strong> 6 nivoa — od Početnika do Maestra! Prati rang-listu, prihvati dvoboj i osvoji nagrade iz čitalačkih izazova.</p>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                        <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Savjeti za čitaoce
                        </h4>
                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                          <li>Ako ne prođeš kviz, čekaj 48 sati — pitanja se randomiziraju svaki put, pa ćeš dobiti novi set.</li>
                          <li>Mlađi čitaoci (R1) nemaju oduzimanje bodova za pogrešne odgovore.</li>
                          <li>Čitaj barem jednom sedmično da zadržiš sedmičnu seriju (streak) i dobiješ bonus obavještenje na svake 4 sedmice.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Grid funkcija */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Award className="w-5 h-5" /> Certifikati
                      </div>
                      <p className="text-sm text-muted-foreground">Svaki položen kviz generiše lijepi digitalni certifikat. Vidljivi su na stranici "Certifikati" u bočnoj traci — možeš ih printati ili pokazati roditeljima.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Flame className="w-5 h-5" /> Sedmična serija
                      </div>
                      <p className="text-sm text-muted-foreground">Rješavaj kvizove svake sedmice da gradiš streak. Na svakih 4 sedmice dobijate posebnu notifikaciju. Serija se prikazuje kao banner na tvom dashboardu.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Bookmark className="w-5 h-5" /> Oznake
                      </div>
                      <p className="text-sm text-muted-foreground">Označi knjige koje te zanimaju direktno iz biblioteke ili sa stranice knjige. Sve označene knjige naći ćeš na jednom mjestu u bočnoj traci.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Swords className="w-5 h-5" /> Dvoboji
                      </div>
                      <p className="text-sm text-muted-foreground">Izazovi čitaoca s sličnim bodovima. Ko skupi više bodova u dogovorenom roku — pobijedi! Dvoboji se vode na tvom profilu.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Medal className="w-5 h-5" /> Značke i nivoi
                      </div>
                      <p className="text-sm text-muted-foreground">6 nivoa: Početnik → Čitalac → Knjigoljubac → Znalac → Stručnjak → Maestro. Svaka značka se automatski dodjeljuje kad pređeš prag bodova.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Star className="w-5 h-5" /> Ocjenjivanje knjiga
                      </div>
                      <p className="text-sm text-muted-foreground">Ocijeni pročitanu knjigu s 1–5 otvorenih knjiga i pomozi drugima u odabiru. Ocjena je vidljiva na stranici svake knjige.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Store className="w-5 h-5" /> Berza knjiga
                      </div>
                      <p className="text-sm text-muted-foreground">Na /razmjena stranici možeš objaviti oglas za prodaju, poklon ili razmjenu fizičkih knjiga — s fotografijom i detaljima.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Trophy className="w-5 h-5" /> Rang-lista
                      </div>
                      <p className="text-sm text-muted-foreground">Javna rang-lista djece i odraslih, odvojena. Filtriraj po sedmici, mjesecu ili godini i vidi gdje se nalaziš.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Bell className="w-5 h-5" /> Notifikacije
                      </div>
                      <p className="text-sm text-muted-foreground">Bell ikona u navigaciji. Dobijaj obavještenja za položen kviz, sedmični streak milestone i preporuke knjiga.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Tvoja čitaonica</h4>
                    <StudentDashboardMock />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: RODITELJ */}
            <TabsContent value="parent">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <Users className="w-10 h-10 text-primary" />
                    Vodič za roditelje
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Kao roditelj, prate te napredak djece i aktivno sudjeluješ u njihovoj čitalačkoj avanturi — ili čitaš i sam!
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <p className="text-xl text-muted-foreground font-medium">Budite podrška svom djetetu i aktivni učesnik u čitalačkoj avanturi.</p>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                          <p><strong>Kreirajte dječije profile:</strong> Možete dodati do 3 dječija računa direktno iz roditeljskog panela. Unesite ime, korisničko ime, lozinku i starosnu grupu.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                          <p><strong>Pratite napredak:</strong> Vidite bodove, pročitane knjige, kviz rezultate, sedmični streak i certifikate svakog djeteta u realnom vremenu.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                          <p><strong>Upravljajte računima:</strong> Promijenite lozinku djeteta ili obrišite profil ako treba — sve putem roditeljskog panela bez kontaktiranja podrške.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                          <p><strong>Povežite se sa školom:</strong> Ako je dijete dobilo račun od učitelja, pošaljite zahtjev za linkovanje da pratite školskog učenika zajedno s nastavnikom.</p>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                        <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Savjet za roditelje
                        </h4>
                        <p className="text-base text-amber-800 dark:text-amber-200">
                          Takmičite se zajedno s djecom! Registrujte i vlastiti čitalački račun — ko skupi više bodova u porodici? Čitanje postaje zajednička igra!
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <Lock className="w-4 h-4" /> Promjena lozinke
                          </div>
                          <p className="text-xs text-muted-foreground">Promijenite lozinku djeteta direktno iz roditeljskog panela bez kontaktiranja podrške.</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <Trash2 className="w-4 h-4" /> Brisanje profila
                          </div>
                          <p className="text-xs text-muted-foreground">Profil koji je roditelj kreirao može se i obrisati — s potvrdom kako bi se spriječila greška.</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <FileText className="w-4 h-4" /> Izvještaj za print
                          </div>
                          <p className="text-xs text-muted-foreground">Printajte kompletan izvještaj o napretku djeteta za roditeljski sastanak ili ličnu arhivu.</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <CalendarCheck className="w-4 h-4" /> Streak praćenje
                          </div>
                          <p className="text-xs text-muted-foreground">Vidite koliko je sedmica zaredom dijete aktivno čitalo i podstičite ga na kontinuitet.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Roditeljski pregled</h4>
                    <ParentDashboardMock />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: UČITELJ */}
            <TabsContent value="teacher">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <GraduationCap className="w-10 h-10 text-primary" />
                    Vodič za učitelje
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Nastavnici kreiraju i prate učenike, dodjeljuju bonus bodove, odobravaju roditelje i mogu predlagati poboljšanja kvizova.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <p className="text-xl text-muted-foreground font-medium">Pretvorite lektiru u najdraži čas vaših učenika.</p>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                          <p><strong>Kreirajte učenike:</strong> Dodajte učenike s korisničkim imenom, lozinkom, razredom (npr. 5a) i starosnom grupom. Lozinku možete mijenjati u svako doba.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                          <p><strong>Pratite grafički:</strong> Bar grafikon prikazuje sve učenike sortirane po bodovima, a pie grafikon top 10 žanrova koje vaši učenici čitaju — korisno za planiranje lektire.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                          <p><strong>Bonus bodovi:</strong> Nagradite truda vrijednog učenika ručnim dodavanjem bonus bodova s razlogom — npr. "Napisao/la prikaz knjige".</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                          <p><strong>Uredite kvizove:</strong> Pronađite knjigu u biblioteci i dodajte 1–5 novih pitanja na postojeći kviz. Pitanja idu na odobrenje admina — pri odobrenju se prikazuje "Kviz odobrio/la: [Vaše ime]".</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">5</span>
                          <p><strong>Odobri roditelje:</strong> Roditelji koji žele pratiti školskog učenika šalju zahtjev — vi ga odobravate ili odbijate iz nastavničkog panela.</p>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                        <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Savjeti za rad
                        </h4>
                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                          <li>Koristite "Print" opciju prije roditeljskog sastanka — svaki roditelj dobije pregled čitalačkih navika djeteta.</li>
                          <li>Razred (5a, 6b...) upišite kod svakog učenika za bolju organizaciju.</li>
                          <li>Koristite sedmični izazov da motivišete učenike na redovno čitanje.</li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <BarChart2 className="w-4 h-4" /> Grafikon bodova
                          </div>
                          <p className="text-xs text-muted-foreground">Horizontalni grafikon svih učenika sortiranih po bodovima — odmah vidite ko prednjači.</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <PieChart className="w-4 h-4" /> Žanrovi čitanja
                          </div>
                          <p className="text-xs text-muted-foreground">Top 10 žanrova s legendom i grupom "Ostali žanrovi" — korisno za planiranje lektire.</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <PenLine className="w-4 h-4" /> Urednik kvizova
                          </div>
                          <p className="text-xs text-muted-foreground">Dodajte 1–5 pitanja na kviz iz vaše biblioteke. Pitanja čekaju odobrenje admina.</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card space-y-1">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Odobrenje roditelja
                          </div>
                          <p className="text-xs text-muted-foreground">Kontrolišete koji roditelji mogu pratiti vaše učenike — zahtjevi čekaju vaše odobrenje.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-center text-slate-500 uppercase tracking-widest text-sm">Interaktivni prikaz panela</h4>
                    <TeacherDashboardMock />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: ŠKOLA */}
            <TabsContent value="school">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <SchoolIcon className="w-10 h-10 text-primary" />
                    Vodič za škole
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Škole se registruju kao institucije i dobivaju poseban školski panel. Administrator odobrava registraciju, a zatim škola može kreirati stotine nastavnika i učenika.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <p className="text-xl text-muted-foreground font-medium">Sistemsko rješenje za promociju pismenosti na nivou cijele škole.</p>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mb-4">
                          <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-1 text-sm">Kako se registrovati?</h4>
                          <p className="text-orange-800 dark:text-orange-200 text-sm">
                            Otvorite stranicu za prijavu i odaberite tab "Škola" (institucionalna registracija). Unesite podatke o školi. Administrator će pregledati i odobriti vaš zahtjev — nakon toga dobijate pristup svim školskim alatima.
                          </p>
                        </div>
                        <ul className="space-y-4">
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                            <p><strong>Centralizacija:</strong> Svi nastavnici, svi razredi i svi učenici na jednom pregledu. Školski administrator vidi statistiku na nivou čitave škole.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                            <p><strong>Monitoring:</strong> Analizirajte trendove čitanja, komparativnu statistiku razreda i najaktivnije čitaoce na nivou škole.</p>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                            <p><strong>Odobravanje nastavnika:</strong> Novi nastavnici koji se registruju uz vašu školu čekaju vaše odobrenje — vi kontrolišete ko ima pristup.</p>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                          <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Za direktore
                          </h4>
                          <p className="text-base text-amber-800 dark:text-amber-200">
                            Čitanje.ba je rješenje koje ne zahtijeva nikakvu IT infrastrukturu — samo registraciju i internet. Platforma se može koristiti odmah, bez instalacije ili obuke.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg border bg-card space-y-1">
                            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                              <Globe className="w-4 h-4" /> Pristup svuda
                            </div>
                            <p className="text-xs text-muted-foreground">Platforma radi na svim uređajima — računar, tablet, mobilni. PWA za brz pristup s telefona.</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card space-y-1">
                            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                              <ShieldCheck className="w-4 h-4" /> Sigurnost podataka
                            </div>
                            <p className="text-xs text-muted-foreground">Lozinke su hashirane, IP adrese anonimizirane, sesije zaštićene. Podaci učenika su sigurni.</p>
                          </div>
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

        {/* CTA sekcija */}
        <section className="max-w-4xl mx-auto px-4 mt-24 text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">Postanite dio naše zajedničke priče</h2>
            <p className="text-xl text-orange-50 mb-8">
              Čitanje.ba je projekat koji raste uz vašu pomoć. Budite partner, sponzor nagrade za učenike ili jednostavno podijelite našu misiju s onima kojima je stalo do čitanja.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" size="lg" className="rounded-full px-8" asChild>
                <Link href="/kontakt">Postani sponzor</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 bg-white/10 border-white/20" asChild>
                <Link href="/biblioteka">Pregledaj biblioteku</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
