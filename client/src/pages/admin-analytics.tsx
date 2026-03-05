import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Eye, Users, Globe, TrendingUp, Calendar, MousePointerClick,
  Smartphone, Monitor, MapPin, ExternalLink, BookOpen, Trophy,
  ShoppingBag, CheckCircle, XCircle, Layers, HelpCircle,
} from "lucide-react";

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "🌍";
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

function formatPath(path: string) {
  const labels: Record<string, string> = {
    "/": "Početna", "/biblioteka": "Biblioteka", "/rang-lista": "Rang-lista",
    "/razmjena": "Berza knjiga", "/vodic": "Vodič", "/blog": "Blog",
    "/login": "Prijava", "/registracija": "Registracija",
    "/ucenik": "Učenik - početna", "/ucitelj": "Učitelj - početna",
    "/roditelj": "Roditelj - početna", "/admin": "Admin - početna",
    "/citanje": "Čitalac - početna",
  };
  if (labels[path]) return labels[path];
  if (path.startsWith("/knjiga/")) return "Detalji knjige";
  if (path.startsWith("/kviz/")) return "Kviz";
  if (path.startsWith("/ucenik/")) return "Učenik - " + path.split("/")[2];
  if (path.startsWith("/admin/")) return "Admin - " + path.split("/")[2];
  if (path.startsWith("/blog/")) return "Blog post";
  return path;
}

const CHART_COLORS = ["#FF861C", "#f97316", "#fb923c", "#4f46e5", "#7c3aed", "#059669", "#0891b2", "#db2777", "#d97706", "#64748b"];
const DEVICE_COLORS: Record<string, string> = { Desktop: "#4f46e5", Mobilni: "#FF861C", Tablet: "#059669", Nepoznato: "#94a3b8" };
const ROLE_COLORS = ["#FF861C", "#4f46e5", "#059669", "#db2777", "#0891b2", "#d97706", "#7c3aed"];

const AGE_GROUP_COLORS: Record<string, string> = { R1: "#06b6d4", R4: "#10b981", R7: "#f59e0b", O: "#8b5cf6", A: "#ef4444" };

type AnalyticsData = {
  summary: { today: number; week: number; month: number; total: number; uniqueToday: number; uniqueMonth: number };
  byDay: { date: string; views: number; unique: number }[];
  topPages: { path: string; views: number }[];
  topCountries: { country: string; countryCode: string; views: number }[];
  topCities: { city: string; country: string; countryCode: string; views: number }[];
  byHour: { hour: number; views: number }[];
  devices: { device: string; views: number }[];
  referrers: { referrer: string; views: number }[];
  quizByDay: { date: string; completions: number }[];
  platformStats: { totalUsers: number; totalBooks: number; totalQuizzes: number; totalQuestions: number; totalResults: number; totalPoints: number };
  usersByRole: { role: string; count: number }[];
  topBooks: { title: string; author: string; ageGroup: string; completions: number }[];
  quizPassRate: { passed: number; failed: number; avgScore: number; avgCorrect: number };
  topUsers: { username: string; fullName: string; points: number; role: string; ageGroup: string }[];
  berzaStats: { total: number; active: number; prodajem: number; poklanjam: number; razmjenjujem: number };
};

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <Icon className="w-5 h-5 text-orange-400" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function MiniBar({ label, value, max, color = "#FF861C" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm mb-0.5">
          <span className="font-medium truncate">{label}</span>
          <span className="text-muted-foreground shrink-0 ml-2">{value.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    staleTime: 4 * 60 * 1000,
  });

  const summary = data?.summary;
  const byDay = data?.byDay || [];
  const topPages = data?.topPages || [];
  const topCountries = data?.topCountries || [];
  const topCities = data?.topCities || [];
  const byHour = data?.byHour || [];
  const devices = data?.devices || [];
  const referrers = data?.referrers || [];
  const quizByDay = data?.quizByDay || [];
  const ps = data?.platformStats;
  const usersByRole = data?.usersByRole || [];
  const topBooks = data?.topBooks || [];
  const qpr = data?.quizPassRate;
  const topUsers = data?.topUsers || [];
  const berza = data?.berzaStats;

  const combinedByDay = byDay.map(d => {
    const qd = quizByDay.find(q => String(q.date).startsWith(String(d.date).substring(0, 10)));
    return {
      date: new Date(d.date).toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" }),
      "Pregledi": d.views,
      "Kvizovi": qd?.completions || 0,
    };
  });

  const hourChartData = byHour.map(h => ({
    sat: `${String(h.hour).padStart(2, "0")}h`,
    "Posjete": h.views,
  }));

  const totalViews = topCountries.reduce((s, c) => s + c.views, 0);
  const totalDeviceViews = devices.reduce((s, d) => s + d.views, 0);
  const totalUsers = usersByRole.reduce((s, r) => s + r.count, 0);

  const passTotal = (qpr?.passed || 0) + (qpr?.failed || 0);
  const passPct = passTotal > 0 ? Math.round((qpr!.passed / passTotal) * 100) : 0;

  const val = (v: number | undefined) => isLoading ? "..." : (v ?? 0).toLocaleString();

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Statistika platforme</h1>
          <p className="text-muted-foreground text-sm">Podaci se osvježavaju svakih 5 minuta (cache)</p>
        </div>

        {/* ── Platforma totali ── */}
        <section className="space-y-3">
          <SectionTitle icon={Layers} title="Pregled platforme" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Korisnici", value: ps?.totalUsers, icon: Users, color: "text-indigo-500" },
              { label: "Knjige", value: ps?.totalBooks, icon: BookOpen, color: "text-orange-500" },
              { label: "Kvizovi", value: ps?.totalQuizzes, icon: HelpCircle, color: "text-emerald-500" },
              { label: "Pitanja", value: ps?.totalQuestions, icon: HelpCircle, color: "text-amber-500" },
              { label: "Riješeni kvizovi", value: ps?.totalResults, icon: CheckCircle, color: "text-green-500" },
              { label: "Ukupno bodova", value: ps?.totalPoints, icon: Trophy, color: "text-yellow-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold">{val(value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Posjete summary ── */}
        <section className="space-y-3">
          <SectionTitle icon={Eye} title="Posjete" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Danas", value: summary?.today, sub: `${summary?.uniqueToday ?? "–"} jedin.` },
              { label: "Sedmica", value: summary?.week, sub: "7 dana" },
              { label: "Ovaj mjesec", value: summary?.month, sub: `${summary?.uniqueMonth ?? "–"} jedin.` },
              { label: "Ukupno", value: summary?.total, sub: "od početka" },
              { label: "Zemlje", value: topCountries.length, sub: "zabilježeno" },
              { label: "Stranice", value: topPages.length, sub: "praćeno" },
            ].map(({ label, value, sub }) => (
              <Card key={label} data-testid={`stat-${label.toLowerCase().replace(/ /g, '-')}`}>
                <CardContent className="pt-4 pb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
                  <p className="text-2xl font-bold mt-1">{val(value)}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Kviz statistike ── */}
        <section className="space-y-3">
          <SectionTitle icon={CheckCircle} title="Kviz statistike" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground uppercase font-medium">Položeno</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{val(qpr?.passed)}</p>
                <p className="text-xs text-muted-foreground">{passPct}% od ukupnih</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground uppercase font-medium">Palo</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{val(qpr?.failed)}</p>
                <p className="text-xs text-muted-foreground">{100 - passPct}% od ukupnih</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground uppercase font-medium">Prosj. score</span>
                </div>
                <p className="text-2xl font-bold">{isLoading ? "..." : (qpr?.avgScore ?? 0)}</p>
                <p className="text-xs text-muted-foreground">bodova</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-muted-foreground uppercase font-medium">Prosj. tačnost</span>
                </div>
                <p className="text-2xl font-bold">{isLoading ? "..." : (qpr?.avgCorrect ?? 0)}%</p>
                <p className="text-xs text-muted-foreground">tačnih odgovora</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Berza ── */}
        <section className="space-y-3">
          <SectionTitle icon={ShoppingBag} title="Berza knjiga" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Ukupno oglasa", value: berza?.total },
              { label: "Aktivni", value: berza?.active },
              { label: "Prodajem", value: berza?.prodajem },
              { label: "Poklanjam", value: berza?.poklanjam },
              { label: "Razmjenjujem", value: berza?.razmjenjujem },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
                  <p className="text-2xl font-bold mt-1">{val(value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Pregledi i kvizovi po danu ── */}
        <section className="space-y-3">
          <SectionTitle icon={Calendar} title="Aktivnost — zadnjih 30 dana" />
          <Card>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : combinedByDay.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">Nema podataka</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={combinedByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF861C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF861C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gQuiz" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Pregledi" stroke="#FF861C" fill="url(#gViews)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="Kvizovi" stroke="#059669" fill="url(#gQuiz)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Sat aktivnosti ── */}
        <section className="space-y-3">
          <SectionTitle icon={Calendar} title="Aktivnost po satu (svi dani)" />
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="sat" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="Posjete" radius={[3, 3, 0, 0]}>
                    {hourChartData.map((entry, i) => {
                      const max = Math.max(...hourChartData.map(h => h["Posjete"]), 1);
                      const alpha = 0.15 + (entry["Posjete"] / max) * 0.85;
                      return <Cell key={i} fill={`rgba(255,134,28,${alpha.toFixed(2)})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* ── 4-kolone: Zemlje, Gradovi, Stranice, Referreri ── */}
        <section className="space-y-3">
          <SectionTitle icon={Globe} title="Geografija i promet" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-400" /> Posjete po zemlji
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topCountries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p>
                ) : topCountries.slice(0, 10).map((c, i) => {
                  const pct = totalViews > 0 ? Math.round((c.views / totalViews) * 100) : 0;
                  return (
                    <div key={c.country} className="flex items-center gap-2" data-testid={`country-${i}`}>
                      <span className="text-lg w-6 text-center">{countryFlag(c.countryCode)}</span>
                      <MiniBar label={`${c.country} (${pct}%)`} value={c.views} max={topCountries[0]?.views || 1} color="#FF861C" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" /> Top gradovi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topCities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nema podataka o gradovima</p>
                ) : topCities.slice(0, 10).map((c, i) => (
                  <div key={c.city + i} className="flex items-center gap-2" data-testid={`city-${i}`}>
                    <span className="text-lg w-6 text-center">{countryFlag(c.countryCode)}</span>
                    <MiniBar label={c.city} value={c.views} max={topCities[0]?.views || 1} color="#fb923c" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-orange-400" /> Najpopularnije stranice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topPages.slice(0, 10).map((p, i) => (
                  <div key={p.path + i} data-testid={`page-${i}`}>
                    <MiniBar label={formatPath(p.path)} value={p.views} max={topPages[0]?.views || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                    <span className="text-[10px] text-muted-foreground font-mono ml-0">{p.path}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-orange-400" /> Odakle dolaze posjetioci
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {referrers.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>Nema vanjskih referrera</p>
                    <p className="text-xs mt-1">Posjetioci dolaze direktno</p>
                  </div>
                ) : referrers.slice(0, 10).map((r, i) => (
                  <div key={r.referrer + i} data-testid={`referrer-${i}`}>
                    <MiniBar label={r.referrer} value={r.views} max={referrers[0]?.views || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Uređaji + Korisnici po ulozi ── */}
        <section className="space-y-3">
          <SectionTitle icon={Monitor} title="Uređaji i korisnici" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-400" /> Tip uređaja
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nema podataka</p>
                ) : (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={150} height={150}>
                      <PieChart>
                        <Pie data={devices.map(d => ({ name: d.device, value: d.views }))} cx="50%" cy="50%" innerRadius={38} outerRadius={68} paddingAngle={3} dataKey="value">
                          {devices.map(d => <Cell key={d.device} fill={DEVICE_COLORS[d.device] || "#94a3b8"} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v.toLocaleString(), "Posjeta"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 flex-1">
                      {devices.map(d => {
                        const pct = totalDeviceViews > 0 ? Math.round((d.views / totalDeviceViews) * 100) : 0;
                        return (
                          <div key={d.device} className="flex items-center justify-between text-sm" data-testid={`device-${d.device.toLowerCase()}`}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEVICE_COLORS[d.device] || "#94a3b8" }} />
                              <span>{d.device}</span>
                            </div>
                            <span className="text-muted-foreground font-mono">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" /> Korisnici po ulozi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersByRole.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nema podataka</p>
                ) : (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={150} height={150}>
                      <PieChart>
                        <Pie data={usersByRole.map(r => ({ name: r.role, value: r.count }))} cx="50%" cy="50%" innerRadius={38} outerRadius={68} paddingAngle={3} dataKey="value">
                          {usersByRole.map((r, i) => <Cell key={r.role} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v.toLocaleString(), "Korisnika"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 flex-1">
                      {usersByRole.map((r, i) => {
                        const pct = totalUsers > 0 ? Math.round((r.count / totalUsers) * 100) : 0;
                        return (
                          <div key={r.role} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ROLE_COLORS[i % ROLE_COLORS.length] }} />
                              <span>{r.role}</span>
                            </div>
                            <span className="text-muted-foreground font-mono">{r.count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Top knjige + Top korisnici ── */}
        <section className="space-y-3">
          <SectionTitle icon={BookOpen} title="Knjige i čitači" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-400" /> Najpopularnije knjige (po kvizovima)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topBooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nema podataka</p>
                ) : (
                  <div className="space-y-2">
                    {topBooks.map((b, i) => (
                      <div key={b.title + i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 font-mono text-right">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="font-medium truncate">{b.title}</span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              <Badge variant="outline" className="text-[10px] py-0 px-1" style={{ borderColor: AGE_GROUP_COLORS[b.ageGroup], color: AGE_GROUP_COLORS[b.ageGroup] }}>{b.ageGroup}</Badge>
                              <span className="text-muted-foreground">{b.completions}×</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.round((b.completions / (topBooks[0]?.completions || 1)) * 100)}%`, backgroundColor: AGE_GROUP_COLORS[b.ageGroup] || "#FF861C" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-400" /> Top čitači po bodovima
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nema korisnika s bodovima</p>
                ) : (
                  <div className="space-y-2">
                    {topUsers.map((u, i) => (
                      <div key={u.username} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 font-mono text-right">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-sm mb-0.5">
                            <div className="truncate">
                              <span className="font-medium">{u.username}</span>
                              <span className="text-muted-foreground text-xs ml-1">({u.fullName})</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              <Badge variant="outline" className="text-[10px] py-0 px-1" style={{ borderColor: AGE_GROUP_COLORS[u.ageGroup], color: AGE_GROUP_COLORS[u.ageGroup] }}>{u.ageGroup}</Badge>
                              <span className="font-medium text-orange-600">{u.points.toLocaleString()} bod.</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-orange-400" style={{ width: `${Math.round((u.points / (topUsers[0]?.points || 1)) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Kvizovi po danu ── */}
        <section className="space-y-3">
          <SectionTitle icon={CheckCircle} title="Kvizovi riješeni po danu — zadnjih 30 dana" />
          <Card>
            <CardContent className="pt-4">
              {quizByDay.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Nema podataka</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={quizByDay.map(d => ({
                      date: new Date(d.date).toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" }),
                      "Kvizovi": d.completions,
                    }))}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="Kvizovi" fill="#059669" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Bar chart po zemljama ── */}
        {topCountries.length > 0 && (
          <section className="space-y-3">
            <SectionTitle icon={Globe} title="Distribucija po zemaljama" />
            <Card>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topCountries.slice(0, 10).map(c => ({ name: c.country, pregledi: c.views }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="pregledi" radius={[4, 4, 0, 0]}>
                      {topCountries.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
