import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check, Sparkles, Star, BookOpen, Trophy, BarChart3,
  Award, Shield, Lock
} from "lucide-react";

interface SubscriptionStatus {
  subscriptionType: string;
  isFree: boolean;
  quizLimit: number | null;
  quizzesUsed: number;
  quizzesRemaining: number | null;
  expiresAt: string | null;
}

const proFeatures = [
  {
    icon: BookOpen,
    title: "Neograničen broj kvizova",
    description: "Riješi koliko god kvizova želiš, bez ograničenja.",
  },
  {
    icon: BarChart3,
    title: "Detaljne statistike",
    description: "Prati svoj napredak kroz detaljne grafikone i analize.",
  },
  {
    icon: Award,
    title: "Digitalne diplome",
    description: "Osvoji posebne diplome i značke za svoja postignuća.",
  },
  {
    icon: Shield,
    title: "Prioritetna podrška",
    description: "Brži odgovor na sva tvoja pitanja i zahtjeve.",
  },
  {
    icon: Trophy,
    title: "Posebni izazovi",
    description: "Pristup ekskluzivnim izazovima samo za Pro čitaoce.",
  },
];

export default function StudentProPage() {
  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  const isPro = subscription && !subscription.isFree;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-pro-title">
              Čitalac Pro
            </h1>
          </div>
          <p className="text-muted-foreground">
            Otključaj puni potencijal svoje čitalačke avanture
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isPro ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg" data-testid="text-pro-active">Čitalac Pro je aktivan!</p>
                  <p className="text-sm text-muted-foreground">
                    Uživaš u neograničenom pristupu svim funkcijama.
                    {subscription?.expiresAt && (
                      <span> Pretplata vrijedi do {new Date(subscription.expiresAt).toLocaleDateString("bs-BA")}.</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-muted p-3 rounded-full shrink-0">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold" data-testid="text-free-status">Besplatni paket</p>
                    <p className="text-sm text-muted-foreground">
                      Iskorišteno {subscription?.quizzesUsed ?? 0} od {subscription?.quizLimit ?? 3} besplatna kviza.
                      {subscription?.quizzesRemaining === 0 && " Nadogradi na Pro za neograničen pristup!"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < (subscription?.quizzesUsed ?? 0)
                          ? "bg-primary"
                          : "bg-muted border-2 border-muted-foreground/20"
                      }`}
                      data-testid={`dot-quiz-${i}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-primary/20 overflow-visible">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="default" className="text-sm px-3 py-1">
                <Star className="mr-1" />
                Najpopularniji
              </Badge>
            </div>
            <CardTitle className="text-2xl">Čitalac Pro</CardTitle>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className="text-4xl font-bold">10</span>
              <span className="text-muted-foreground">KM / godišnje</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3" data-testid={`feature-pro-${i}`}>
                  <div className="bg-primary/10 p-1.5 rounded-md shrink-0 mt-0.5">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {!isPro && (
              <Button size="lg" className="w-full" asChild data-testid="button-upgrade-pro">
                <Link href="/kontakt">
                  <Sparkles className="mr-2" />
                  Nadogradi na Čitalac Pro
                </Link>
              </Button>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Kontaktirajte nas za aktivaciju Pro paketa. Plaćanje se vrši direktno.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usporedba paketa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { feature: "Pristup biblioteci", free: true, pro: true },
                { feature: "Rješavanje kvizova", free: "3 kviza", pro: "Neograničeno" },
                { feature: "Sakupljanje bodova", free: true, pro: true },
                { feature: "Tabela čitalaca", free: true, pro: true },
                { feature: "Detaljne statistike", free: false, pro: true },
                { feature: "Digitalne diplome", free: false, pro: true },
                { feature: "Prioritetna podrška", free: false, pro: true },
                { feature: "Posebni izazovi", free: false, pro: true },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b last:border-0" data-testid={`row-compare-${i}`}>
                  <span className="flex-1 text-sm">{row.feature}</span>
                  <span className="w-20 text-center text-sm">
                    {row.free === true ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : row.free === false ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{row.free}</span>
                    )}
                  </span>
                  <span className="w-20 text-center text-sm">
                    {row.pro === true ? (
                      <Check className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <span className="text-xs font-medium text-primary">{row.pro}</span>
                    )}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                <span className="flex-1" />
                <span className="w-20 text-center font-medium">Besplatno</span>
                <span className="w-20 text-center font-medium text-primary">Pro</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
