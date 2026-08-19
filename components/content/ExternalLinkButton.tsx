import { ExternalLink, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExternalLinkButtonProps = {
  url: string | null | undefined;
  className?: string;
};

/** N'autorise que les liens http(s) — évite les schémas javascript:/data:. */
function safeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
  } catch {
    return null;
  }
  return null;
}

function isLinkedInUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').endsWith('linkedin.com');
  } catch {
    return false;
  }
}

/** Bouton vers la publication d'origine (LinkedIn ou autre lien externe). */
export default function ExternalLinkButton({ url, className }: ExternalLinkButtonProps) {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return null;
  const safeUrl = safeExternalUrl(trimmed);
  if (!safeUrl) return null;
  const isLinkedIn = isLinkedInUrl(safeUrl);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
        isLinkedIn
          ? 'bg-[#0A66C2] text-white hover:bg-[#004182]'
          : 'bg-gray-900 text-white hover:bg-gray-700',
        className
      )}
    >
      {isLinkedIn ? <Linkedin className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
      {isLinkedIn ? 'Voir sur LinkedIn' : 'Voir la publication d’origine'}
    </a>
  );
}
