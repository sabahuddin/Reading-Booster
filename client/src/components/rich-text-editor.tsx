import { useRef, useCallback } from "react";
import { Bold, Italic, Highlighter, RemoveFormatting } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "data-testid"?: string;
}

const HIGHLIGHT_COLORS = [
  { name: "Žuti", class: "highlight-yellow", bg: "#fef08a" },
  { name: "Zeleni", class: "highlight-green", bg: "#bbf7d0" },
  { name: "Narandžasti", class: "highlight-orange", bg: "#fed7aa" },
];

export function RichTextEditor({ value, onChange, className, ...props }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const saveSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      selectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
    }
  }, []);

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { start, end } = selectionRef.current;
    const selected = value.substring(start, end);
    if (!selected) return;
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newValue);
    const newSelStart = start + before.length;
    const newSelEnd = newSelStart + selected.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newSelStart, newSelEnd);
    });
  }, [value, onChange]);

  const handleBold = useCallback(() => {
    wrapSelection("**", "**");
  }, [wrapSelection]);

  const handleItalic = useCallback(() => {
    wrapSelection("*", "*");
  }, [wrapSelection]);

  const handleHighlight = useCallback((colorClass: string) => {
    wrapSelection(`<mark class="${colorClass}">`, "</mark>");
  }, [wrapSelection]);

  const handleRemoveFormatting = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { start, end } = selectionRef.current;
    let selected = value.substring(start, end);
    if (!selected) return;
    selected = selected.replace(/\*\*(.+?)\*\*/g, "$1");
    selected = selected.replace(/\*(.+?)\*/g, "$1");
    selected = selected.replace(/<mark[^>]*>(.+?)<\/mark>/g, "$1");
    const newValue = value.substring(0, start) + selected + value.substring(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, start + selected.length);
    });
  }, [value, onChange]);

  const handleSelect = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  const handleMouseUp = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  const handleKeyUp = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-1 border rounded-t-md px-2 py-1 bg-muted/50" data-testid="rich-text-toolbar">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold" onMouseDown={(e) => { e.preventDefault(); handleBold(); }} data-testid="button-bold">
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onMouseDown={(e) => { e.preventDefault(); handleItalic(); }} data-testid="button-italic">
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-1" />

        {HIGHLIGHT_COLORS.map((color) => (
          <Tooltip key={color.class}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 relative"
                onMouseDown={(e) => { e.preventDefault(); handleHighlight(color.class); }}
                data-testid={`button-highlight-${color.class}`}
              >
                <Highlighter className="h-4 w-4" />
                <span
                  className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border"
                  style={{ backgroundColor: color.bg }}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{color.name} marker</TooltipContent>
          </Tooltip>
        ))}

        <div className="w-px h-4 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onMouseDown={(e) => { e.preventDefault(); handleRemoveFormatting(); }} data-testid="button-remove-format">
              <RemoveFormatting className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ukloni formatiranje</TooltipContent>
        </Tooltip>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        className={`flex w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || "min-h-[200px]"}`}
        data-testid={props["data-testid"]}
      />
    </div>
  );
}
