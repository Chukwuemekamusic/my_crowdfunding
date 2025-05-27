// types/navigation.ts
import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number; // Optional badge count for notifications
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}
