// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, FileEdit, WalletCards } from "lucide-react";
import { Campaign } from "@/types/campaign";
import ActivityFeed from "@/components/ActivityFeed";

interface DashboardStats {
  totalCampaigns: number;
  totalRaised: string;
  activeCampaigns: number;
  draftCount: number;
}

export default function DashboardPage() {
  const { contract, address } = useWeb3();
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    totalRaised: "0",
    activeCampaigns: 0,
    draftCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!contract || !address) return;

      try {
        setIsLoading(true);
        // Get all user campaigns in one call
        console.log("Dashboard: Fetching campaigns for address:", address);
        console.log("Dashboard: Contract address:", await contract.getAddress());

        const campaigns = await contract.getUserCampaigns(address);

        console.log("Dashboard: Fetched user campaigns:", campaigns.length);
        console.log("Dashboard: Raw campaigns data:", campaigns);

        // Also check total campaign count for debugging
        const totalCampaignCount = await contract.campaignCount();
        console.log("Dashboard: Total campaigns in contract:", Number(totalCampaignCount));

        // Process campaigns on frontend
        const now = Math.floor(Date.now() / 1000);

        // Calculate stats
        const totalRaised = campaigns.reduce(
          (acc: bigint, campaign: Campaign) =>
            acc + BigInt(campaign.amountCollected),
          BigInt(0)
        );

        const activeCampaigns = campaigns.filter(
          (c: Campaign) => {
            const status = Number(c.status);
            const isPublished = status === 1;
            const deadline = Number(c.deadline);
            const isNotExpired = deadline > now;
            const isActive = isPublished && isNotExpired;

            console.log(`Campaign ${c.id} "${c.title}": status=${c.status} (${status}), deadline=${deadline}, now=${now}`);
            console.log(`  - isPublished: ${isPublished}, isNotExpired: ${isNotExpired}, isActive: ${isActive}`);
            console.log(`  - Time remaining: ${deadline - now} seconds (${Math.round((deadline - now) / 3600)} hours)`);

            return isActive;
          }
        ).length;

        const draftCount = campaigns.filter(
          (c: Campaign) => Number(c.status) === 0
        ).length;

        console.log("Dashboard stats:", {
          totalCampaigns: campaigns.length,
          activeCampaigns,
          draftCount,
        });

        setStats({
          totalCampaigns: campaigns.length,
          totalRaised: ethers.formatEther(totalRaised),
          activeCampaigns,
          draftCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Set up event listeners for contract events
    if (contract && address) {
      // Listen for campaign creation events
      const onCampaignCreated = (_campaignId: any, owner: string) => {
        if (owner === address) {
          console.log("Dashboard: Campaign created by user, refreshing stats");
          fetchStats();
        }
      };

      // Listen for campaign published events
      const onCampaignPublished = (_campaignId: any, owner: string) => {
        if (owner === address) {
          console.log("Dashboard: Campaign published by user, refreshing stats");
          fetchStats();
        }
      };

      // Listen for campaign cancelled events (draft deletion)
      const onCampaignCancelled = (_campaignId: any, owner: string) => {
        if (owner === address) {
          console.log("Dashboard: Campaign cancelled by user, refreshing stats");
          fetchStats();
        }
      };

      // Set up event filters and listeners
      contract.on("CampaignCreated", onCampaignCreated);
      contract.on("CampaignPublished", onCampaignPublished);
      contract.on("CampaignCancelled", onCampaignCancelled);

      // Refresh stats when user returns to dashboard (visibility change)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchStats();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        // Clean up event listeners
        contract.off("CampaignCreated", onCampaignCreated);
        contract.off("CampaignPublished", onCampaignPublished);
        contract.off("CampaignCancelled", onCampaignCancelled);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [contract, address]);

  const stats_items = [
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns,
      icon: BarChart3,
    },
    {
      title: "Total Raised",
      value: `${Number(stats.totalRaised).toFixed(4)} ETH`,
      icon: WalletCards,
    },
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns,
      icon: TrendingUp,
    },
    {
      title: "Draft Campaigns",
      value: stats.draftCount,
      icon: FileEdit,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats_items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : item.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Feed */}
      {contract && address && (
        <div className="grid gap-8 md:grid-cols-2">
          <ActivityFeed contract={contract} address={address} />
          {/* We can add another component here later, like a chart */}
        </div>
      )}
    </div>
  );
}
