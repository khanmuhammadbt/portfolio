import {
  Atom,
  BadgeCheck,
  Braces,
  Code2,
  Database,
  FileCode2,
  FlaskConical,
  GitBranch,
  Globe,
  Layers,
  LayoutTemplate,
  Mail,
  MapPin,
  Palette,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { GithubIcon, InstagramIcon, WhatsappIcon, YoutubeIcon } from "../components/icons";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>> | LucideIcon;

/** Registry so CMS content can reference icons by string key */
export const ICONS: Record<string, IconComponent> = {
  atom: Atom,
  badgecheck: BadgeCheck,
  braces: Braces,
  code2: Code2,
  database: Database,
  filecode2: FileCode2,
  flask: FlaskConical,
  gitbranch: GitBranch,
  globe: Globe,
  layers: Layers,
  layout: LayoutTemplate,
  mail: Mail,
  mappin: MapPin,
  palette: Palette,
  rocket: Rocket,
  server: Server,
  sparkles: Sparkles,
  terminal: Terminal,
  user: User,
  zap: Zap,
  github: GithubIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
  youtube: YoutubeIcon,
};

export const ICON_CHOICES = Object.keys(ICONS);

export function getIcon(name: string): IconComponent {
  return ICONS[name] ?? Sparkles;
}
