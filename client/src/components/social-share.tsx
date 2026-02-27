import { Share2 } from "lucide-react";
import { SiFacebook, SiWhatsapp, SiViber, SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  title: string;
  url?: string;
  compact?: boolean;
}

export function SocialShare({ title, url, compact = false }: SocialShareProps) {
  const { toast } = useToast();
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      name: "Facebook",
      icon: SiFacebook,
      color: "hover:text-[#1877F2]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: SiWhatsapp,
      color: "hover:text-[#25D366]",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Viber",
      icon: SiViber,
      color: "hover:text-[#7360F2]",
      href: `viber://forward?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Instagram",
      icon: SiInstagram,
      color: "hover:text-[#E4405F]",
      href: `https://www.instagram.com/`,
    },
    {
      name: "TikTok",
      icon: SiTiktok,
      color: "hover:text-foreground",
      href: `https://www.tiktok.com/`,
    },
    {
      name: "X",
      icon: SiX,
      color: "hover:text-foreground",
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({ title: "Link kopiran!" });
    });
  }

  const iconSize = compact ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`} data-testid="social-share">
      {!compact && (
        <span className="text-sm text-muted-foreground mr-1">Podijeli:</span>
      )}
      {networks.map((net) => (
        <a
          key={net.name}
          href={net.href}
          target="_blank"
          rel="noopener noreferrer"
          title={net.name}
          data-testid={`share-${net.name.toLowerCase()}`}
          className={`inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors ${net.color}`}
        >
          <net.icon className={iconSize} />
        </a>
      ))}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        onClick={handleCopyLink}
        title="Kopiraj link"
        data-testid="share-copy-link"
      >
        <Share2 className={iconSize} />
      </Button>
    </div>
  );
}
