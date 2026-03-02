import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, X } from "lucide-react";

interface PdfViewerProps {
  url: string;
  title: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const [open, setOpen] = useState(false);
  const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  return (
    <>
      <div className="flex items-center gap-3" data-testid="pdf-actions">
        <Button
          variant="default"
          size="sm"
          onClick={() => setOpen(true)}
          data-testid="button-read-online"
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Čitaj online
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          data-testid="button-download-pdf"
        >
          <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" download>
            <FileText className="h-4 w-4 mr-1" />
            Preuzmi
          </a>
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full h-full max-w-5xl bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-white shrink-0">
              <span className="font-medium text-sm truncate">{title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                data-testid="button-close-pdf"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <iframe
              src={`${absoluteUrl}#toolbar=1&navpanes=0`}
              title={`PDF - ${title}`}
              className="w-full flex-1"
              style={{ border: "none" }}
              data-testid="iframe-pdf"
            />
          </div>
        </div>
      )}
    </>
  );
}
