import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Eye, Users, Globe, TrendingUp, Calendar, MousePointerClick,
  Smartphone, Monitor, MapPin, ExternalLink, BookOpen,
} from "lucide-react";

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "🌍";
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

function formatPath(path: string) {
  const labels: Record<string, string> = {
    "/": "Početna",
    "/biblioteka": "Biblioteka",
    "/rang-lista": "Rang-lista",
    "/razmjena": "Berza knjiga",
    "/vodic": "Vodič",
    "/blog": "Blog",
    "/login": "Prijava",
    "/registracija": "Registracija",
    "/ucenik": "Učenik - početna",
    "/ucitelj": "Učitelj - početna",
    "/roditelj": "Roditelj - početna",
    "/admin": "Admin - početna",
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

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

const CHART_COLORS = ["#FF861C", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#4f46e5", "#7c3aed", "#db2777", "#059669", "#0891b2"];
const DEVICE_COLORS: Record<string, string> = {
  "Desktop": "#4f46e5",
  "Mobilni": "#FF861C",
  "Tablet": "#059669",
  "Nepoznato": "#94a3b8",
};

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
};

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
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

  const dailyChartData = byDay.map(d => ({
    date: new Date(d.date).toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" }),
    "Pregledi": d.views,
    "Jedinstveni": d.unique,
  }));

  const combinedByDay = byDay.map(d => {
    const qd = quizByDay.find(q => String(q.date).startsWith(String(d.date).substring(0, 10)));
    return {
      date: new Date(d.date).toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" }),
      "Pregledi": d.views,
      "Kvizovi": qd?.completions || 0,
    };
  });

  const hourChartData = byHour.map(h => ({
    sat: hourLabel(h.hour),
    "Posjete": h.views,
  }));

  const totalViews = topCountries.reduce((s, c) => s + c.views, 0);
  const totalDeviceViews = devices.reduce((s, d) => s + d.views, 0);

  const pieData = devices.map(d => ({ name: d.device, value: d.views }));

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistika posjeta</h1>
          <p className="text-muted-foreground">Pregled posjetilaca, lokacija i ponašanja</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Danas", value: summary?.today, icon: Eye, sub: `${summary?.uniqueToday ?? "–"} jedinstvenih` },
            { label: "Sedmica", value: summary?.week, icon: TrendingUp, sub: "zadnjih 7 dana" },
            { label: "Ovaj mjesec", value: summary?.month, icon: Calendar, sub: `${summary?.uniqueMonth ?? "–"} jedinstvenih` },
            { label: "Ukupno", value: summary?.total, icon: MousePointerClick, sub: "od početka" },
            { label: "Zemlje", value: topCountries.length, icon: Globe, sub: "zabilježeno" },
            { label: "Stranica", value: topPages.length, icon: Users, sub: "praćeno" },
          ].map(({ label, value, icon: Icon, sub }) => (
            <Card key={label} data-testid={`stat-${label.toLowerCase().replace(/ /g, '-')}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : (value ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Chart: Pregledi + Kvizovi */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pregledi i kvizovi — zadnjih 30 dana</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
            ) : combinedByDay.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Nema podataka</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={combinedByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF861C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF861C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Pregledi" stroke="#FF861C" fill="url(#colorViews)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Kvizovi" stroke="#059669" fill="url(#colorQuiz)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sat aktivnosti */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aktivnost po satu (svi dani)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="sat" tick={{ fontSize: 10 }} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="Posjete" radius={[3, 3, 0, 0]}>
                    {hourChartData.map((entry, i) => {
                      const v = entry["Posjete"];
                      const max = Math.max(...hourChartData.map(h => h["Posjete"]), 1);
                      const intensity = v / max;
                      const alpha = Math.round(40 + intensity * 215);
                      return <Cell key={i} fill={`rgba(255, 134, 28, ${(alpha / 255).toFixed(2)})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-400" /> Posjete po zemlji
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : topCountries.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Nema podataka o geolokaciji</div>
              ) : (
                <div className="space-y-2">
                  {topCountries.slice(0, 10).map((c, i) => {
                    const pct = totalViews > 0 ? Math.round((c.views / totalViews) * 100) : 0;
                    return (
                      <div key={c.country} className="flex items-center gap-3" data-testid={`country-${i}`}>
                        <span className="text-xl w-7 text-center">{countryFlag(c.countryCode)}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="font-medium">{c.country}</span>
                            <span className="text-muted-foreground">{c.views.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" /> Top gradovi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : topCities.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Nema podataka o gradovima</div>
              ) : (
                <div className="space-y-2">
                  {topCities.slice(0, 10).map((c, i) => {
                    const maxCity = topCities[0]?.views || 1;
                    const pct = Math.round((c.views / maxCity) * 100);
                    return (
                      <div key={c.city + i} className="flex items-center gap-3" data-testid={`city-${i}`}>
                        <span className="text-xl w-7 text-center">{countryFlag(c.countryCode)}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="font-medium">{c.city}</span>
                            <span className="text-muted-foreground">{c.views.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-orange-300" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-orange-400" /> Najpopularnije stranice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : topPages.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Nema podataka</div>
              ) : (
                <div className="space-y-2">
                  {topPages.slice(0, 10).map((p, i) => {
                    const maxViews = topPages[0]?.views || 1;
                    const pct = Math.round((p.views / maxViews) * 100);
                    return (
                      <div key={p.path + i} className="flex items-center gap-3" data-testid={`page-${i}`}>
                        <span className="text-xs text-muted-foreground w-5 text-right font-mono">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="font-medium truncate">{formatPath(p.path)}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">{p.views.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{p.path}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referreri */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-orange-400" /> Odakle dolaze posjetioci
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : referrers.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  <div className="text-center space-y-1">
                    <p>Nema podataka o referrerima</p>
                    <p className="text-xs">(Većina posjetilaca dolazi direktno ili putem bookmarkova)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrers.slice(0, 10).map((r, i) => {
                    const maxR = referrers[0]?.views || 1;
                    const pct = Math.round((r.views / maxR) * 100);
                    return (
                      <div key={r.referrer + i} className="flex items-center gap-3" data-testid={`referrer-${i}`}>
                        <span className="text-xs text-muted-foreground w-5 text-right font-mono">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="font-medium truncate">{r.referrer}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">{r.views.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Uređaji + Kvizovi po danu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Uređaji — Pie chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4 text-orange-400" />
                <Smartphone className="w-4 h-4 text-orange-400" />
                Tip uređaja
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : devices.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Nema podataka</div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [`${val.toLocaleString()}`, "Posjeta"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {devices.map((d) => {
                      const pct = totalDeviceViews > 0 ? Math.round((d.views / totalDeviceViews) * 100) : 0;
                      return (
                        <div key={d.device} className="flex items-center justify-between text-sm" data-testid={`device-${d.device.toLowerCase()}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEVICE_COLORS[d.device] || "#94a3b8" }} />
                            <span>{d.device}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">{pct}% ({d.views.toLocaleString()})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kvizovi po danu */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-400" /> Kvizovi riješeni — zadnjih 30 dana
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
              ) : quizByDay.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Nema podataka o kvizovima</div>
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
        </div>

        {/* Distribucija po zemljama — Bar chart */}
        {topCountries.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribucija po zemaljama</CardTitle>
            </CardHeader>
            <CardContent>
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
        )}
      </div>
    </DashboardLayout>
  );
}
