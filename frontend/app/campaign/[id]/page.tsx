// app/campaign/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import toast from "react-hot-toast";

const categories = [
  "Technology",
  "Art",
  "Community",
  "Business",
  "Charity",
  "Other",
];

export default function CampaignDetail() {
  const { id } = useParams();
  const { contract, address, isConnected } = useWeb3();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!contract) return;

      try {
        setIsLoading(true);
        setError(null);
        const campaigns = await contract.getPublishedCampaigns();
        if (!campaigns) {
          toast.error("no campaign");
        }
        console.log("campaigns", campaigns);

        // const campaigns = await contract.getCampaigns();
        const campaign = campaigns[Number(id)];
        setCampaign(campaign);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("Failed to load campaign details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [contract, id]);

  const handleDonate = async () => {
    if (!contract || !donationAmount) return;

    try {
      setIsDonating(true);
      const tx = await contract.donateToCampaign(id, {
        value: ethers.parseEther(donationAmount),
      });
      await tx.wait();
      // Refresh campaign data
      const campaigns = await contract.getCampaigns();
      setCampaign(campaigns[Number(id)]);
      setDonationAmount("");
    } catch (error) {
      console.error("Error donating:", error);
      setError("Failed to process donation.");
    } finally {
      setIsDonating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Campaign not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const progress =
    (Number(campaign.amountCollected) * 100) / Number(campaign.target);
  const deadline = new Date(Number(campaign.deadline) * 1000);
  const isExpired = deadline < new Date();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-96 w-full">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <Badge variant={isExpired ? "destructive" : "secondary"}>
                {categories[campaign.category]}
              </Badge>
            </div>

            <p className="text-muted-foreground mb-4">
              Created by {campaign.owner.slice(0, 6)}...
              {campaign.owner.slice(-4)}
            </p>

            <p className="whitespace-pre-wrap">{campaign.description}</p>
          </div>
        </div>

        {/* Donation Card */}
        <div>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Progress value={progress} className="h-2" />

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-lg font-medium">
                    {ethers.formatEther(campaign.amountCollected)} ETH
                  </span>
                  <span className="text-muted-foreground">
                    raised of {ethers.formatEther(campaign.target)} ETH
                  </span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{campaign.donorCount} donors</span>
                  <span>
                    {isExpired
                      ? "Ended"
                      : `${Math.ceil(
                          (deadline.getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )} days left`}
                  </span>
                </div>
              </div>

              {isConnected && !isExpired && (
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.01"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="w-full px-3 py-2 border rounded"
                  />

                  <Button
                    onClick={handleDonate}
                    disabled={isDonating || !donationAmount}
                    className="w-full"
                  >
                    {isDonating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Donate"
                    )}
                  </Button>
                </div>
              )}

              {!isConnected && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connect your wallet to donate to this campaign
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
