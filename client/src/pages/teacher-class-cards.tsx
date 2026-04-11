import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Printer, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface CardData {
  id: string;
  fullName: string;
  username: string;
  newPassword: string;
}

interface CardsResponse {
  classroom: { id: string; name: string };
  teacher: { fullName: string; schoolName: string };
  cards: CardData[];
}

export default function TeacherClassCards() {
  const params = useParams<{ classroomId: string }>();
  const classroomId = params.classroomId;
  const [data, setData] = useState<CardsResponse | null>(null);
  const [generated, setGenerated] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/teacher/classrooms/${classroomId}/generate-cards`);
      return res.json() as Promise<CardsResponse>;
    },
    onSuccess: (result) => {
      setData(result);
      setGenerated(true);
    },
  });

  if (!generated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-4">
              <Printer className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Printaj kartice odjeljenja</h1>
            <p className="text-muted-foreground text-sm">
              Klik na dugme generisaće <strong>nove lozinke</strong> za sve učenike u odjeljenju i prikazati ih za štampu.
              Stare lozinke više neće biti važeće.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-left">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Pažnja!</p>
              <p>Ova akcija resetuje lozinke svim učenicima u odjeljenju. Svaki učenik dobija novu, nasumičnu lozinku koja će biti prikazana na karticama.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/ucitelj/ucenici">
              <Button variant="outline" className="w-full sm:w-auto" data-testid="button-back-to-students">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazad
              </Button>
            </Link>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-generate-cards"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generisanje...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Generiši kartice i resetuj lozinke
                </>
              )}
            </Button>
          </div>

          {generateMutation.isError && (
            <p className="text-red-500 text-sm">
              Greška: {(generateMutation.error as any)?.message || "Neuspješno generisanje"}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const today = new Date().toLocaleDateString("hr-HR");

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 10mm;
        }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { padding: 0; }
          .card-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4mm;
          }
          .student-card {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 6mm;
            height: 52mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        }
        @media screen {
          .card-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .student-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            min-height: 160px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
          }
        }
        .page-break {
          page-break-before: always;
        }
      `}</style>

      <div className="no-print bg-gray-50 border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/ucitelj/ucenici">
            <Button variant="ghost" size="sm" data-testid="button-back-cards">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Nazad
            </Button>
          </Link>
          <div>
            <p className="font-semibold text-sm">{data.classroom.name} — {data.cards.length} kartica</p>
            <p className="text-xs text-muted-foreground">Lozinke su resetovane. Sačuvajte ovaj dokument!</p>
          </div>
        </div>
        <Button onClick={() => window.print()} data-testid="button-print-cards">
          <Printer className="mr-2 h-4 w-4" />
          Printaj
        </Button>
      </div>

      <div className="print-page p-4 max-w-[210mm] mx-auto">
        {Array.from({ length: Math.ceil(data.cards.length / 15) }).map((_, pageIdx) => {
          const pageCards = data.cards.slice(pageIdx * 15, (pageIdx + 1) * 15);
          return (
            <div key={pageIdx} className={pageIdx > 0 ? "page-break mt-6" : ""}>
              <div className="mb-4 border-b pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <img
                    src="/logo.png"
                    alt="Čitanje.ba"
                    className="h-8 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <p className="font-bold text-base leading-tight">Čitanje.ba</p>
                    <p className="text-xs text-gray-500">platforma za unapređenje čitanja</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-2">
                  {data.teacher.schoolName && (
                    <span><span className="font-semibold">Škola:</span> {data.teacher.schoolName}</span>
                  )}
                  <span><span className="font-semibold">Odjeljenje:</span> {data.classroom.name}</span>
                  <span><span className="font-semibold">Nastavnik:</span> {data.teacher.fullName}</span>
                  <span className="ml-auto text-gray-400 text-xs">{today}</span>
                </div>
              </div>

              <div className="card-grid">
                {pageCards.map((card) => (
                  <div key={card.id} className="student-card" data-testid={`card-student-${card.id}`}>
                    <div>
                      <p className="font-bold text-sm leading-snug mb-2">{card.fullName}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-24 shrink-0">Korisničko ime:</span>
                          <span className="font-mono text-sm font-semibold">{card.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-24 shrink-0">Lozinka:</span>
                          <span className="font-mono text-sm font-bold text-primary">{card.newPassword}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-300">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        ⚠ OVE PODATKE NEMOJ IZGUBITI
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
