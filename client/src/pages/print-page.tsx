import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
}

const BADGE_LEVELS = [
  { min: 0, label: "Početnik", icon: "📚" },
  { min: 50, label: "Čitalac", icon: "📖" },
  { min: 150, label: "Knjigoljubac", icon: "🌟" },
  { min: 350, label: "Znalac", icon: "🏆" },
  { min: 700, label: "Stručnjak", icon: "💎" },
  { min: 1200, label: "Maestro", icon: "👑" },
];

function getBadge(points: number) {
  let badge = BADGE_LEVELS[0];
  for (const b of BADGE_LEVELS) {
    if (points >= b.min) badge = b;
  }
  return badge;
}

// ─── SCHOOL ADMIN REPORT ───────────────────────────────────────────────────
function SchoolReport() {
  const { data: stats } = useQuery<any>({ queryKey: ["/api/school/stats"] });
  const { data: students } = useQuery<any[]>({ queryKey: ["/api/school-admin/students"] });
  const { data: teachers } = useQuery<any[]>({ queryKey: ["/api/school-admin/teachers"] });

  const ready = stats && students && teachers;

  useEffect(() => {
    if (ready) {
      setTimeout(() => window.print(), 800);
    }
  }, [ready]);

  if (!ready) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Učitavanje podataka...</div>;
  }

  const today = fmtDate(new Date());
  const sortedStudents = [...students].sort((a, b) => (b.points || 0) - (a.points || 0));

  // Classes summary
  const classMap = new Map<string, { count: number; points: number }>();
  for (const s of students) {
    const k = s.className || "—";
    const cur = classMap.get(k) || { count: 0, points: 0 };
    classMap.set(k, { count: cur.count + 1, points: cur.points + (s.points || 0) });
  }
  const classes = Array.from(classMap.entries())
    .map(([name, v]) => ({ name, ...v, avg: v.count > 0 ? Math.round(v.points / v.count) : 0 }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div style={{ fontFamily: "Georgia, serif", padding: "20mm", maxWidth: "210mm", margin: "0 auto", fontSize: 12 }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, margin: 0, color: "#FF861C" }}>Čitanje.ba</h1>
        <h2 style={{ fontSize: 16, margin: "4px 0 0", fontWeight: "normal" }}>{stats.schoolName || "Škola"} — Izvještaj</h2>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>Datum: {today}</p>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Učitelja", value: stats.totalTeachers },
          { label: "Učenika", value: stats.totalStudents },
          { label: "Ukupno bodova", value: stats.totalPoints?.toLocaleString() },
          { label: "Prosjek bodova", value: stats.avgPoints },
          { label: "Kvizova riješeno", value: stats.totalQuizzes },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#FF861C" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Classes */}
      <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Pregled razreda</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["Razred", "Učenika", "Ukupno bodova", "Prosjek bodova"].map(h => (
              <th key={h} style={{ border: "1px solid #ddd", padding: "5px 8px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classes.map(c => (
            <tr key={c.name}>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold" }}>{c.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{c.count}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{c.points}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{c.avg}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Teachers */}
      <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Nastavnici</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["Ime i prezime", "Korisničko ime", "Razred(i)", "Maks. učenika"].map(h => (
              <th key={h} style={{ border: "1px solid #ddd", padding: "5px 8px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teachers.map((t, i) => (
            <tr key={t.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold" }}>{t.fullName}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{t.username}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{t.className || "—"}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{t.maxStudentAccounts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Top 30 students */}
      <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>
        Top učenici (po bodovima)
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["#", "Ime i prezime", "Razred", "Starosna grupa", "Nastavnik", "Bodovi"].map(h => (
              <th key={h} style={{ border: "1px solid #ddd", padding: "5px 8px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.slice(0, 50).map((s, i) => (
            <tr key={s.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px", color: "#888" }}>{i + 1}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold" }}>{s.fullName}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{s.className || "—"}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{s.ageGroup || "—"}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{s.teacherName}</td>
              <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold", color: "#FF861C" }}>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 8, fontSize: 10, color: "#888", textAlign: "center" }}>
        Čitanje.ba — Izvještaj generisan {today}
      </div>
    </div>
  );
}

// ─── TEACHER REPORT ─────────────────────────────────────────────────────────
function TeacherReport() {
  const { user } = useAuth();
  const { data: students = [] } = useQuery<any[]>({ queryKey: ["/api/teacher/students"] });

  useEffect(() => {
    if (students.length > 0) {
      setTimeout(() => window.print(), 800);
    }
  }, [students.length]);

  if (!students.length) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Učitavanje podataka...</div>;
  }

  const today = fmtDate(new Date());
  const sorted = [...students].sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
  const totalPoints = students.reduce((s: number, u: any) => s + (u.points || 0), 0);
  const avgPoints = students.length > 0 ? Math.round(totalPoints / students.length) : 0;
  const totalQuizzes = students.reduce((s: number, u: any) => s + (u.quizzesTaken || 0), 0);

  return (
    <div style={{ fontFamily: "Georgia, serif", padding: "20mm", maxWidth: "210mm", margin: "0 auto", fontSize: 12 }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, margin: 0, color: "#FF861C" }}>Čitanje.ba</h1>
        <h2 style={{ fontSize: 16, margin: "4px 0 0", fontWeight: "normal" }}>
          Izvještaj razreda — {user?.fullName}
        </h2>
        {user?.schoolName && <p style={{ margin: "2px 0 0", fontSize: 12 }}>{user.schoolName}</p>}
        {user?.className && <p style={{ margin: "2px 0 0", fontSize: 12 }}>Razred: {user.className}</p>}
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>Datum: {today}</p>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Učenika", value: students.length },
          { label: "Ukupno bodova", value: totalPoints },
          { label: "Prosjek bodova", value: avgPoints },
          { label: "Kvizova ukupno", value: totalQuizzes },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#FF861C" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Students table */}
      <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>
        Lista učenika — rangirani po bodovima
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["#", "Ime i prezime", "Korisničko ime", "Razred", "Starosna gr.", "Bodovi", "Kvizovi", "Bedž"].map(h => (
              <th key={h} style={{ border: "1px solid #ddd", padding: "5px 8px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((s: any, i) => {
            const badge = getBadge(s.points || 0);
            return (
              <tr key={s.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", color: "#888" }}>{i + 1}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold" }}>{s.fullName}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", color: "#666" }}>{s.username}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{s.className || "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{s.ageGroup || "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold", color: "#FF861C" }}>{s.points || 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{s.quizzesTaken || 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{badge.icon} {badge.label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 8, fontSize: 10, color: "#888", textAlign: "center" }}>
        Čitanje.ba — Izvještaj generisan {today}
      </div>
    </div>
  );
}

// ─── STUDENT REPORT ─────────────────────────────────────────────────────────
function StudentReport() {
  const { user } = useAuth();
  const { data: results = [] } = useQuery<any[]>({ queryKey: ["/api/quiz-results/my"] });

  useEffect(() => {
    if (user) {
      setTimeout(() => window.print(), 1000);
    }
  }, [user]);

  if (!user) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Učitavanje...</div>;
  }

  const today = fmtDate(new Date());
  const badge = getBadge(user.points || 0);
  const sorted = [...results].sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  const passed = results.filter((r: any) => r.passed).length;
  const avgPct = results.length > 0
    ? Math.round(results.reduce((s: number, r: any) => s + (r.correctAnswers / r.totalQuestions) * 100, 0) / results.length)
    : 0;

  return (
    <div style={{ fontFamily: "Georgia, serif", padding: "20mm", maxWidth: "210mm", margin: "0 auto", fontSize: 12 }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, margin: 0, color: "#FF861C" }}>Čitanje.ba</h1>
        <h2 style={{ fontSize: 16, margin: "4px 0 0", fontWeight: "normal" }}>Lični izvještaj čitača</h2>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>Datum: {today}</p>
      </div>

      {/* Profile card */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 40 }}>{badge.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>{user.fullName}</div>
          <div style={{ fontSize: 12, color: "#555" }}>@{user.username}</div>
          {user.className && <div style={{ fontSize: 12 }}>Razred: <strong>{user.className}</strong></div>}
          {user.ageGroup && <div style={{ fontSize: 12 }}>Starosna grupa: <strong>{user.ageGroup}</strong></div>}
          {user.schoolName && <div style={{ fontSize: 12 }}>Škola: <strong>{user.schoolName}</strong></div>}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#FF861C" }}>{user.points || 0}</div>
          <div style={{ fontSize: 11, color: "#555" }}>bodova</div>
          <div style={{ marginTop: 4, fontSize: 12, fontWeight: "bold" }}>{badge.label}</div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Kvizova urađeno", value: results.length },
          { label: "Položenih kvizova", value: passed },
          { label: "Nepoloženih", value: results.length - passed },
          { label: "Prosječan rezultat", value: `${avgPct}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#FF861C" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Badge levels */}
      <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Sistem bodova i bedževi</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {BADGE_LEVELS.map((b) => (
          <div key={b.label} style={{
            padding: "4px 10px", borderRadius: 20, fontSize: 11,
            border: `2px solid ${user.points >= b.min ? "#FF861C" : "#ddd"}`,
            background: user.points >= b.min ? "#fff7ed" : "#f9f9f9",
            fontWeight: user.points >= b.min ? "bold" : "normal",
          }}>
            {b.icon} {b.label} ({b.min}+)
          </div>
        ))}
      </div>

      {/* Quiz results */}
      <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>
        Istorija kvizova ({results.length})
      </h3>
      {sorted.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>Nema urađenih kvizova.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              {["Datum", "Knjiga", "Tačni odg.", "Ukupno pitan.", "Rezultat", "Status"].map(h => (
                <th key={h} style={{ border: "1px solid #ddd", padding: "5px 8px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r: any, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", whiteSpace: "nowrap" }}>{fmtDate(r.completedAt)}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{r.bookTitle || r.quizTitle || "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{r.correctAnswers}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{r.totalQuestions}</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", fontWeight: "bold" }}>{r.score} bod.</td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px", color: r.passed ? "#16a34a" : "#dc2626", fontWeight: "bold" }}>
                  {r.passed ? "✓ Položen" : "✗ Nije položen"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 8, fontSize: 10, color: "#888", textAlign: "center" }}>
        Čitanje.ba — Lični izvještaj generisan {today}
      </div>
    </div>
  );
}

// ─── PARENT REPORT ───────────────────────────────────────────────────────────
function ParentReport() {
  const { user } = useAuth();
  const { data: familyMembers = [] } = useQuery<any[]>({ queryKey: ["/api/parent/family-members"] });
  const { data: children = [] } = useQuery<any[]>({ queryKey: ["/api/parent/children"] });

  const allChildren = [...familyMembers, ...children];
  const ready = user !== null && (familyMembers !== undefined || children !== undefined);

  useEffect(() => {
    if (ready) {
      setTimeout(() => window.print(), 800);
    }
  }, [ready]);

  if (!user) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Učitavanje...</div>;
  }

  const today = fmtDate(new Date());

  return (
    <div style={{ fontFamily: "Georgia, serif", padding: "20mm", maxWidth: "210mm", margin: "0 auto", fontSize: 12 }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, margin: 0, color: "#FF861C" }}>Čitanje.ba</h1>
        <h2 style={{ fontSize: 16, margin: "4px 0 0", fontWeight: "normal" }}>Roditeljski izvještaj — {user.fullName}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>Datum: {today}</p>
      </div>

      {allChildren.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>Nema dodanih djece.</p>
      ) : (
        allChildren.map((child: any) => {
          const badge = getBadge(child.points || 0);
          return (
            <div key={child.id} style={{ marginBottom: 24, border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: "bold" }}>{child.fullName}</div>
                  <div style={{ fontSize: 12, color: "#555" }}>@{child.username}</div>
                  {child.className && <div style={{ fontSize: 12 }}>Razred: <strong>{child.className}</strong></div>}
                  {child.ageGroup && <div style={{ fontSize: 12 }}>Starosna grupa: <strong>{child.ageGroup}</strong></div>}
                  {child.schoolName && <div style={{ fontSize: 12 }}>Škola: <strong>{child.schoolName}</strong></div>}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#FF861C" }}>{child.points || 0}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>bodova</div>
                  <div style={{ marginTop: 4, fontSize: 12 }}>{badge.icon} {badge.label}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "Kvizova", value: child.quizzesTaken || 0 },
                  { label: "Ukupno bodova", value: child.points || 0 },
                  { label: "Bedž", value: `${badge.icon} ${badge.label}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: "bold", color: "#FF861C" }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 8, fontSize: 10, color: "#888", textAlign: "center" }}>
        Čitanje.ba — Roditeljski izvještaj generisan {today}
      </div>
    </div>
  );
}

// ─── MAIN ROUTER ─────────────────────────────────────────────────────────────
export default function PrintPage() {
  const { user, isAuthenticated } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const type = params.get("tip");

  if (!isAuthenticated || !user) {
    return <Redirect to="/prijava" />;
  }

  // Auto-determine type based on role if not specified
  const reportType = type || (
    user.role === "school_admin" ? "skola" :
    user.role === "teacher" ? "razred" :
    user.role === "parent" ? "roditelj" :
    "ucenik"
  );

  if (reportType === "skola" && (user.role === "school_admin" || user.role === "admin")) {
    return <SchoolReport />;
  }
  if (reportType === "razred" && (user.role === "teacher" || user.role === "admin")) {
    return <TeacherReport />;
  }
  if (reportType === "roditelj" && user.role === "parent") {
    return <ParentReport />;
  }
  if (reportType === "ucenik" || reportType === "citanje") {
    return <StudentReport />;
  }

  return <Redirect to="/" />;
}
