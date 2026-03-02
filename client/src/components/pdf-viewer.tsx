import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";

interface PdfViewerProps {
  url: string;
  title: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const [expanded, setExpanded] = useState(false);

  const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  return (
    <Card data-testid="card-pdf-viewer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Čitaj online
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-pdf"
          >
            {expanded ? (
              <>
                <Minimize2 className="h-4 w-4 mr-1" />
                Smanji
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-1" />
                Proširi
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="w-full rounded-lg overflow-hidden border bg-muted"
          style={{ height: expanded ? "85vh" : "500px" }}
        >
          <iframe
            src={`${absoluteUrl}#toolbar=1&navpanes=0`}
            title={`PDF - ${title}`}
            className="w-full h-full"
            style={{ border: "none" }}
            data-testid="iframe-pdf"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            Koristite kontrole u PDF pregledaču za navigaciju kroz stranice.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="button-download-pdf"
          >
            <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" download>
              <FileText className="h-4 w-4 mr-1" />
              Preuzmi PDF
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
