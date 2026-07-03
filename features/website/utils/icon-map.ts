import {
  Camera,
  Users,
  Award,
  Star,
  Heart,
  Clock,
  Phone,
  Mail,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Camera,
  Users,
  Award,
  Star,
  Heart,
  Clock,
  Phone,
  Mail,
  MapPin,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Camera;
}
