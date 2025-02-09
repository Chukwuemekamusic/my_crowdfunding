// app/dashboard/layout.tsx
"use client";
import { useWeb3 } from "@/hooks/useWeb3";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, LayoutDashboard, FilePen, Bookmark, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const navigation = [
  {
    name: "Overview",
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, connect } = useWeb3();
  const pathname = usePathname();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert>
            <AlertDescription>
              Please connect your wallet to access the dashboard.
            </AlertDescription>
          </Alert>
          <Button onClick={connect} className="w-full">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r">
        <div className="h-16 border-b flex items-center px-4">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors hover:bg-accent ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="h-16 border-b flex items-center px-8">
          <h2 className="text-lg font-semibold">
            {navigation.find((item) => item.href === pathname)?.name ||
              "Dashboard"}
          </h2>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
