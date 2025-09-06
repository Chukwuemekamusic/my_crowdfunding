"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import CampaignCard from "@/components/CampaignCard";
import { Loader2, Heart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ethers } from "ethers";

interface DonationInfo {
  campaignId: number;
  amount: string;
  timestamp: number;
  noOfDonations: number;
}

export default function FollowingPage() {
  const { contract, address, isConnected } = useWeb3();
  const [followedCampaigns, setFollowedCampaigns] = useState<Campaign[]>([]);
  const [donationInfo, setDonationInfo] = useState<Record<number, DonationInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowedCampaigns = async () => {
      if (!contract || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get all published campaigns
        const result = await contract.getPublishedCampaigns({ offset: 0, limit: 1000 });
        const [allCampaigns] = result;

        const campaignsWithDonations: Campaign[] = [];
        const donationData: Record<number, DonationInfo> = {};

        // Check each campaign to see if user has donated
        for (const campaign of allCampaigns) {
          try {
            // Try to get donor info - this will throw if user hasn't donated
            const donorInfo = await contract.getDonorInfo(campaign.id, address);
            
            // If we get here, user has donated to this campaign
            campaignsWithDonations.push(campaign);
            donationData[Number(campaign.id)] = {
              campaignId: Number(campaign.id),
              amount: ethers.formatEther(donorInfo[0]),
              timestamp: Number(donorInfo[1]),
              noOfDonations: Number(donorInfo[2]),
            };
          } catch (error) {
            // User hasn't donated to this campaign, skip it
            continue;
          }
        }

        setFollowedCampaigns(campaignsWithDonations);
        setDonationInfo(donationData);
      } catch (error) {
        console.error("Error fetching followed campaigns:", error);
        setError("Failed to load followed campaigns. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowedCampaigns();
  }, [contract, address]);

  // Helper function to get campaign status
  const getCampaignStatus = (campaign: Campaign) => {
    const now = Date.now() / 1000;
    const isActive = Number(campaign.deadline) > now;
    const isFunded = Number(campaign.amountCollected) >= Number(campaign.target);
    
    if (isActive) return 'active';
    if (isFunded) return 'funded';
    return 'ended';
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-center">
          Connect your wallet to see campaigns you&apos;ve supported
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Following</h1>
          <p className="text-muted-foreground">
            Campaigns you&apos;ve supported with your donations
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading your supported campaigns...</span>
        </div>
      ) : followedCampaigns.length > 0 ? (
        <>
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You&apos;re following <strong>{followedCampaigns.length}</strong> campaign
              {followedCampaigns.length !== 1 ? 's' : ''} that you&apos;ve donated to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedCampaigns.map((campaign) => {
              const donation = donationInfo[Number(campaign.id)];
              return (
                <div key={campaign.id} className="relative">
                  <CampaignCard 
                    campaign={campaign} 
                    id={Number(campaign.id)}
                    status={getCampaignStatus(campaign)}
                  />
                  {donation && (
                    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your support:</span>
                        <span className="font-medium text-primary">
                          {donation.amount} ETH
                        </span>
                      </div>
                      {donation.noOfDonations > 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {donation.noOfDonations} donations
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns followed yet</h3>
          <p className="text-muted-foreground mb-4">
            When you donate to campaigns, they&apos;ll appear here so you can track their progress.
          </p>
          <p className="text-sm text-muted-foreground">
            Start by exploring campaigns on the{" "}
            <Link href="/" className="text-primary hover:underline">
              home page
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
