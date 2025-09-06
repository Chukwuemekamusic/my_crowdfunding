import React from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNotifications } from "@/hooks/useNotifications";
import TestnetBanner from "@/components/TestnetBanner";
import PortfolioFooter from "@/components/PortfolioFooter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layout,
  LayoutDashboard,
  FilePen,
  Bookmark,
  Bell,
  Home,
  PlusCircle,
  Wallet,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/types/navigation";
import { WalletButton } from "../WalletButton";

const browseNavigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Layers,
  },
];

const userNavigation = [
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

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, connect, address } = useWeb3();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  const NavigationLink = ({ item }: { item: NavigationItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    const isNotifications = item.href === "/dashboard/notifications";

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className="relative">
          <Icon className="h-4 w-4" />
          {isNotifications && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Testnet Banner */}
      <TestnetBanner />

      <div className="flex flex-1">
        {/* Sidebar */}
      <div className="w-64 bg-card border-r flex flex-col">
        <div className="h-16 border-b flex items-center px-4">
          <Link href="/" className="text-xl font-bold">
            CrowdFund
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Browse Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
                Browse
              </h3>
              <nav className="space-y-1">
                {browseNavigation.map((item) => (
                  <NavigationLink key={item.name} item={item} />
                ))}
              </nav>
            </div>

            {/* Create Campaign Button */}
            <div className="px-3">
              <Link href="/campaign/create">
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>

            {/* User Section - Only show if connected */}
            {isConnected && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
                  My Account
                </h3>
                <nav className="space-y-1">
                  {userNavigation.map((item) => (
                    <NavigationLink key={item.name} item={item} />
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Connect Wallet Section */}
        <div className="p-4 border-t">
          {isConnected ? (
            <div className="px-3 py-2 text-sm">
              <div className="font-medium">Connected Wallet</div>
              <div className="text-muted-foreground">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
          ) : (
            <Button onClick={connect} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b flex items-center justify-between px-8 ">
          <h1 className="text-lg font-semibold">
            {pathname === "/"
              ? "Home"
              : pathname.split("/").pop()?.replace(/-/g, " ")}
          </h1>
          <div className="flex items-center space-x-4">
            <WalletButton />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
      </div>

      {/* Portfolio Footer */}
      <PortfolioFooter />
    </div>
  );
}
