import {
  Award,
  BookOpen,
  CheckCircle,
  Ear,
  Globe,
  Handshake,
  Heart,
  MessageCircle,
  Scale,
  Shield,
  Star,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Mapping icône/couleur pour les contenus "organization" (valeurs,
 * distinctions). Les clés correspondent aux choix définis côté Django
 * (organization.models.CoreValue.ICON_CHOICES / COLOR_CHOICES).
 */
export const ORG_ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  'message-circle': MessageCircle,
  scale: Scale,
  'check-circle': CheckCircle,
  ear: Ear,
  users: Users,
  heart: Heart,
  star: Star,
  handshake: Handshake,
  globe: Globe,
  sun: Sun,
  'book-open': BookOpen,
};

export const ORG_COLOR_MAP: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-red-600',
  purple: 'from-purple-500 to-pink-600',
  yellow: 'from-yellow-500 to-orange-600',
  cyan: 'from-cyan-500 to-blue-600',
  red: 'from-red-500 to-red-600',
  pink: 'from-pink-500 to-rose-600',
};

export function orgIcon(name: string): LucideIcon {
  return ORG_ICON_MAP[name] ?? Award;
}

export function orgColor(name: string): string {
  return ORG_COLOR_MAP[name] ?? 'from-orange-500 to-red-500';
}
