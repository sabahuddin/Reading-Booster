const ALLOWED_MARK_CLASSES = ["highlight-yellow", "highlight-green", "highlight-orange"];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderBlogContent(content: string): string {
  const markPlaceholders: string[] = [];
  let processed = content.replace(/<mark\s+class="(highlight-(?:yellow|green|orange))">(.*?)<\/mark>/g, (_match, cls, text) => {
    if (ALLOWED_MARK_CLASSES.includes(cls)) {
      const idx = markPlaceholders.length;
      markPlaceholders.push(`<mark class="${cls}">${escapeHtml(text)}</mark>`);
      return `%%MARK_${idx}%%`;
    }
    return text;
  });

  processed = escapeHtml(processed);

  processed = processed.replace(/%%MARK_(\d+)%%/g, (_match, idx) => {
    return markPlaceholders[parseInt(idx)] || "";
  });

  processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  processed = processed.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>');
  processed = processed.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>');

  processed = processed.replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>');

  processed = processed.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');

  processed = processed.replace(/\n{2,}/g, "</p><p>");
  processed = `<p>${processed}</p>`;
  processed = processed.replace(/<p>\s*<h([23])/g, "<h$1");
  processed = processed.replace(/<\/h([23])>\s*<\/p>/g, "</h$1>");
  processed = processed.replace(/<p>\s*<li/g, "<li");
  processed = processed.replace(/<\/li>\s*<\/p>/g, "</li>");

  return processed;
}
