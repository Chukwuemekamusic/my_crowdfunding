// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, FileEdit, WalletCards } from "lucide-react";
import { Campaign } from "@/types/campaign";

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
        // Fetch all campaigns for the user
        // TODO: create a function that filters the user's campaigns directly
        const allCampaigns = await contract.getCampaigns();
        const userCampaigns = allCampaigns.filter(
          (campaign: Campaign) => campaign.owner === address
        );

        // Fetch user's draft campaigns
        const draftCampaigns = await contract.getUserDraftCampaigns(address);

        // Calculate total raised from all user's published campaigns
        const totalRaised = userCampaigns.reduce(
          (acc: bigint, campaign: Campaign) =>
            acc + BigInt(campaign.amountCollected),
          BigInt(0)
        );

        // Count active campaigns (not ended)
        const now = Math.floor(Date.now() / 1000);
        const activeCampaigns = userCampaigns.filter(
          (campaign: Campaign) =>
            Number(campaign.deadline) > now && campaign.status === 1
        );

        setStats({
          totalCampaigns: userCampaigns.length,
          totalRaised: ethers.formatEther(totalRaised),
          activeCampaigns: activeCampaigns.length,
          draftCount: draftCampaigns.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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

      {/* Recent Activity or Charts could go here */}
    </div>
  );
}
