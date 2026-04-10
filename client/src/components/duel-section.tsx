import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, Trophy, Clock, CheckCircle, XCircle, Zap, PartyPopper, Shield, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Duel } from "@shared/schema";

interface EnrichedDuel extends Duel {
  challengerName: string;
  challengerPoints: number;
  opponentName: string;
  opponentPoints: number;
  winnerName?: string | null;
  challengerGained?: number;
  opponentGained?: number;
  finished?: boolean;
}

interface SentDuel {
  id: string;
  opponent_id: string;
  opponent_name: string;
  opponent_points: number;
  target_points: number;
  deadline: string;
  status: string;
}

function DuelProgress({ duel, userId }: { duel: EnrichedDuel; userId: string }) {
  const { data: checkData } = useQuery<EnrichedDuel & { challengerGained: number; opponentGained: number; finished: boolean }>({
    queryKey: ["/api/duels", duel.id, "check"],
    queryFn: async () => {
      const res = await apiRequest("POST", `/api/duels/${duel.id}/check`);
      const data = await res.json();
      if (data.finished) {
        queryClient.invalidateQueries({ queryKey: ["/api/duels/active"] });
        queryClient.invalidateQueries({ queryKey: ["/api/duels/my"] });
        queryClient.invalidateQueries({ queryKey: ["/api/duels/pending"] });
        queryClient.invalidateQueries({ queryKey: ["/api/duels/my-sent"] });
      }
      return data;
    },
    refetchInterval: 30000,
    enabled: duel.status === "active",
  });

  const current = checkData || duel;
  const isChallenger = userId === duel.challengerId;
  const myGained = isChallenger ? (current.challengerGained ?? 0) : (current.opponentGained ?? 0);
  const theirGained = isChallenger ? (current.opponentGained ?? 0) : (current.challengerGained ?? 0);
  const myName = isChallenger ? current.challengerName : current.opponentName;
  const theirName = isChallenger ? current.opponentName : current.challengerName;
  const myProgress = Math.min(100, (myGained / duel.targetPoints) * 100);
  const theirProgress = Math.min(100, (theirGained / duel.targetPoints) * 100);

  const deadline = new Date(duel.deadline);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  if (current.finished && current.winnerId) {
    const isWinner = current.winnerId === userId;
    return (
      <div className="space-y-4">
        <div className={`text-center p-4 rounded-lg ${isWinner ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
          {isWinner ? (
            <>
              <PartyPopper className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-green-700 dark:text-green-400" data-testid="text-duel-result">BRAVO! Pobijedio/la si!</p>
            </>
          ) : (
            <>
              <Shield className="h-10 w-10 text-red-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-red-700 dark:text-red-400" data-testid="text-duel-result">Duel je završen. Sljedeći put!</p>
            </>
          )}
        </div>
        <ProgressBars myName={myName} theirName={theirName} myGained={myGained} theirGained={theirGained} target={duel.targetPoints} myProgress={myProgress} theirProgress={theirProgress} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{daysLeft} dana preostalo</span>
        </div>
        <Badge variant="outline">Cilj: {duel.targetPoints} bodova</Badge>
      </div>
      <ProgressBars myName={myName} theirName={theirName} myGained={myGained} theirGained={theirGained} target={duel.targetPoints} myProgress={myProgress} theirProgress={theirProgress} />
    </div>
  );
}

function ProgressBars({ myName, theirName, myGained, theirGained, target, myProgress, theirProgress }: {
  myName: string; theirName: string; myGained: number; theirGained: number; target: number; myProgress: number; theirProgress: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{myName} (ti)</span>
          <span className="text-muted-foreground">{myGained}/{target}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${myProgress}%` }} data-testid="progress-my-duel" />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{theirName}</span>
          <span className="text-muted-foreground">{theirGained}/{target}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${theirProgress}%` }} data-testid="progress-opponent-duel" />
        </div>
      </div>
    </div>
  );
}

export default function DuelSection() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: activeDuel, isLoading: loadingActive } = useQuery<EnrichedDuel | null>({
    queryKey: ["/api/duels/active"],
  });

  const { data: pendingDuels, isLoading: loadingPending } = useQuery<EnrichedDuel[]>({
    queryKey: ["/api/duels/pending"],
  });

  const { data: sentDuels } = useQuery<SentDuel[]>({
    queryKey: ["/api/duels/my-sent"],
  });

  const { data: allDuels } = useQuery<EnrichedDuel[]>({
    queryKey: ["/api/duels/my"],
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/duels/active"] });
    queryClient.invalidateQueries({ queryKey: ["/api/duels/my"] });
    queryClient.invalidateQueries({ queryKey: ["/api/duels/pending"] });
    queryClient.invalidateQueries({ queryKey: ["/api/duels/my-sent"] });
  };

  const createDuel = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/duels/create");
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Zahtjev poslan!", description: "Čekamo da protivnik prihvati izazov." });
    },
    onError: (error: any) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const acceptDuel = useMutation({
    mutationFn: async (duelId: string) => {
      const res = await apiRequest("POST", `/api/duels/${duelId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Duel prihvaćen!", description: "Neka počne takmičenje!" });
    },
    onError: (error: any) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const declineDuel = useMutation({
    mutationFn: async (duelId: string) => {
      const res = await apiRequest("POST", `/api/duels/${duelId}/decline`);
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Duel odbijen" });
    },
    onError: (error: any) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const duelWins = user?.duelWins ?? 0;
  const completedDuels = allDuels?.filter(d => d.status === "completed") ?? [];

  if (loadingActive || loadingPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Swords className="text-muted-foreground" />
            Duel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Swords className="text-muted-foreground" />
          Duel
          {duelWins > 0 && (
            <Badge variant="secondary" className="ml-auto" data-testid="text-duel-wins">
              <Trophy className="h-3 w-3 mr-1" />
              {duelWins} pobjeda
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {pendingDuels && pendingDuels.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Primljeni izazovi</p>
            {pendingDuels.map((d) => (
              <div key={d.id} className="p-3 rounded-lg border border-primary/30 bg-primary/5" data-testid={`card-pending-duel-${d.id}`}>
                <p className="text-sm font-medium mb-2">
                  <Zap className="inline h-4 w-4 text-primary mr-1" />
                  {d.challengerName} te izaziva na duel!
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Cilj: {d.targetPoints} bodova za 7 dana
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptDuel.mutate(d.id)}
                    disabled={acceptDuel.isPending || !!activeDuel}
                    data-testid={`button-accept-duel-${d.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Prihvati
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineDuel.mutate(d.id)}
                    disabled={declineDuel.isPending}
                    data-testid={`button-decline-duel-${d.id}`}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Odbij
                  </Button>
                </div>
                {activeDuel && (
                  <p className="text-xs text-muted-foreground mt-2">Završi aktivan duel da bi prihvatio novi.</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeDuel ? (
          <DuelProgress duel={activeDuel} userId={user?.id || ""} />
        ) : (
          <div className="text-center py-3">
            <Swords className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Izazovi nekoga sa sličnim brojem bodova!
            </p>
            <Button
              onClick={() => createDuel.mutate()}
              disabled={createDuel.isPending}
              data-testid="button-create-duel"
            >
              <Swords className="h-4 w-4 mr-2" />
              {createDuel.isPending ? "Tražim protivnika..." : "Pošalji izazov"}
            </Button>
          </div>
        )}

        {sentDuels && sentDuels.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Čekaju odgovor</p>
            <div className="space-y-2">
              {sentDuels.map((d) => {
                const deadline = new Date(d.deadline);
                const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                return (
                  <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted" data-testid={`card-sent-duel-${d.id}`}>
                    <div className="flex items-center gap-2">
                      <Send className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>vs {d.opponent_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {daysLeft}d
                    </div>
                  </div>
                );
              })}
            </div>
            {!activeDuel && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => createDuel.mutate()}
                disabled={createDuel.isPending}
                data-testid="button-create-another-duel"
              >
                <Swords className="h-3.5 w-3.5 mr-1" />
                Pošalji još jedan izazov
              </Button>
            )}
          </div>
        )}

        {completedDuels.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Prethodni dueli</p>
            <div className="space-y-2">
              {completedDuels.slice(0, 3).map((d) => {
                const isWinner = d.winnerId === user?.id;
                const isChallenger = d.challengerId === user?.id;
                const opponentName = isChallenger ? d.opponentName : d.challengerName;
                return (
                  <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted" data-testid={`card-completed-duel-${d.id}`}>
                    <span>vs {opponentName}</span>
                    <Badge variant={isWinner ? "default" : "secondary"}>
                      {isWinner ? "Pobjeda" : "Poraz"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
