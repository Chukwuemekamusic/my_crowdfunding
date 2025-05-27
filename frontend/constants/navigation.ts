// constants/navigation.ts
import {
  Layout,
  LayoutDashboard,
  FilePen,
  Bookmark,
  Bell,
  Home,
  Search,
  PlusCircle,
  Wallet,
  Layers,
} from "lucide-react";

export const browseNavigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Explore Campaigns",
    href: "/explore",
    icon: Search,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Layers,
  },
];

export const userNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Campaigns",
    href: "/dashboard/campaigns",
    icon: Layout,
  },
  {
    name: "Drafts",
    href: "/dashboard/drafts",
    icon: FilePen,
  },
  {
    name: "Following",
    href: "/dashboard/following",
    icon: Bookmark,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
];
