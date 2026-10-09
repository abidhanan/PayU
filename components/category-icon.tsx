import {
  Code,
  Palette,
  PenTool,
  Megaphone,
  Video,
  Search,
  Sparkles,
  Music,
  Camera,
  LineChart,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  code: Code,
  palette: Palette,
  "pen-tool": PenTool,
  megaphone: Megaphone,
  video: Video,
  search: Search,
  sparkles: Sparkles,
  music: Music,
  camera: Camera,
  "line-chart": LineChart,
};

export function CategoryIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Sparkles;
  return <Icon className={className} />;
}

export const CATEGORY_ICONS = Object.keys(MAP);
