import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from "recharts";
import { Eye, Users, Globe, TrendingUp, Calendar, MousePointerClick } from "lucide-react";

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

const CHART_COLORS = ["#FF861C", "#f97316", "#fb923c", "#fdba74", "#fed7aa"];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<{
    summary: { today: number; week: number; month: number; total: number; uniqueToday: number; uniqueMonth: number };
    byDay: { date: string; views: number; unique: number }[];
    topPages: { path: string; views: number }[];
    topCountries: { country: string; countryCode: string; views: number }[];
  }>({
    queryKey: ["/api/admin/analytics"],
  });

  const summary = data?.summary;
  const byDay = data?.byDay || [];
  const topPages = data?.topPages || [];
  const topCountries = data?.topCountries || [];

  const chartData = byDay.map(d => ({
    date: new Date(d.date).toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" }),
    "Pregledi": d.views,
    "Jedinstveni": d.unique,
  }));

  const totalViews = topCountries.reduce((s, c) => s + c.views, 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistika posjeta</h1>
          <p className="text-muted-foreground">Pregled posjetilaca i njihove lokacije</p>
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

        {/* Daily Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Posjete — zadnjih 30 dana</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Učitavanje...</div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Nema podataka</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF861C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF861C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Pregledi" stroke="#FF861C" fill="url(#colorViews)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Jedinstveni" stroke="#4f46e5" fill="url(#colorUnique)" strokeWidth={2} dot={false} />
                </AreaChart>
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
                            <div
                              className="h-full rounded-full bg-orange-400"
                              style={{ width: `${pct}%` }}
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
        </div>

        {/* Countries Bar Chart */}
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
