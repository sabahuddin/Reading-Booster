import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School as SchoolIcon, TrendingUp } from "lucide-react";

export default function SchoolDashboard() {
  const { user } = useAuth();

  // Adjusted to handle both 'school' and 'admin' for preview/testing
  if (!user || (user.role !== "school" && user.role !== "admin")) {
    return <Redirect to="/" />;
  }

  return (
    <DashboardLayout role={user.role as any}>
      <div className="space-y-8 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-4xl font-bold">Kontrolna tabla ustanove</h1>
          <p className="text-muted-foreground text-lg">
            Dobrodošli, {user.fullName}. Pregled statistike za {user.schoolName || "vašu ustanovu"}.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno učenika</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">300</div>
              <p className="text-xs text-muted-foreground">+12 novih ovog mjeseca</p>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nastavnici/Muallimi</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">Aktivni u sistemu</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pročitane knjige</CardTitle>
              <SchoolIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-muted-foreground">Ukupan broj za cijelu školu</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosjek bodova</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84.2</div>
              <p className="text-xs text-muted-foreground">Po učeniku</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upravljanje nastavnim kadrom</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Pregled svih nastavnika i njihovih razreda.</p>
              <div className="text-sm text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                Lista nastavnika i pripadajućih učenika će biti prikazana ovdje.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mjesečni izvještaj</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Statistika čitanja po odjeljenjima.</p>
              <div className="text-sm text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                Grafički prikaz napretka ustanove.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
