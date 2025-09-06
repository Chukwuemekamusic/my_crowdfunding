import React, { useState } from "react";
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
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavigationLink = ({ item, onClick }: { item: NavigationItem; onClick?: () => void }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    const isNotifications = item.href === "/dashboard/notifications";

    return (
      <Link
        href={item.href}
        onClick={onClick}
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
        <span className="text-sm">{item.name}</span>
      </Link>
    );
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Testnet Banner */}
      <TestnetBanner />

      <div className="flex flex-1">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar - Hidden on mobile unless toggled */}
        <div className={cn(
          "w-64 bg-card border-r flex flex-col transition-transform duration-300 ease-in-out z-50",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "fixed lg:relative inset-y-0 left-0"
        )}>
          {/* Mobile Close Button */}
          <div className="h-16 border-b flex items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold" onClick={closeSidebar}>
              CrowdFund
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
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
                    <NavigationLink key={item.name} item={item} onClick={closeSidebar} />
                  ))}
                </nav>
              </div>

              {/* Create Campaign Button */}
              <div className="px-3">
                <Link href="/campaign/create" onClick={closeSidebar}>
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
                      <NavigationLink key={item.name} item={item} onClick={closeSidebar} />
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
                <div className="text-muted-foreground text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            ) : (
              <Button onClick={connect} className="w-full text-sm">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Top Header - Mobile responsive */}
          <div className="h-16 border-b flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold truncate">
                {pathname === "/"
                  ? "Home"
                  : pathname.split("/").pop()?.replace(/-/g, " ")}
              </h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <WalletButton />
            </div>
          </div>
          {/* Main Content Area - Better mobile padding */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Portfolio Footer */}
      <PortfolioFooter />
    </div>
  );
}
