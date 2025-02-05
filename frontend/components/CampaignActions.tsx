"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Heart, HeartOff, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { Campaign } from "@/types/campaign";

interface CampaignActionsProps {
  campaign: Campaign;
  isOwner: boolean;
  address: string | null;
  contract: ethers.Contract | null;
  onCampaignUpdate: () => Promise<void>;
}

export default function CampaignActions({
  campaign,
  isOwner,
  address,
  contract,
  onCampaignUpdate,
}: CampaignActionsProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // This will need to be managed through a database

  const handleWithdraw = async () => {
    if (!contract) return;

    try {
      setIsWithdrawing(true);

      // // Debug all withdrawal conditions
      // console.log("Campaign details:", {
      //   owner: campaign.owner.toLowerCase(),
      //   currentUser: address?.toLowerCase(),
      //   isOwner: campaign.owner.toLowerCase() === address?.toLowerCase(),
      //   amountCollected: campaign.amountCollected.toString(),
      //   withdrawnAmount: campaign.withdrawnAmount.toString(),
      //   remainingBalance: (
      //     campaign.amountCollected - campaign.withdrawnAmount
      //   ).toString(),
      //   deadline: new Date(Number(campaign.deadline) * 1000),
      //   isEnded: new Date(Number(campaign.deadline) * 1000) < new Date(),
      //   allowFlexibleWithdrawal: campaign.allowFlexibleWithdrawal,
      // });

      const tx = await contract.withdrawCampaignFunds(Number(campaign.id));
      await tx.wait();
      await onCampaignUpdate();
      toast.success("Funds withdrawn successfully!");
    } catch (error: any) {
      console.error("Error withdrawing funds:", error);
      // Check for specific error codes or custom errors if available
      if (error.code === "CALL_EXCEPTION") {
        if (error.data && error.data.includes("CampaignActive")) {
          toast.error("Cannot withdraw while campaign is active");
        } else if (error.data && error.data.includes("InsufficientBalance")) {
          toast.error("No funds available to withdraw");
        } else {
          toast.error("Failed to withdraw funds due to a contract error");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: campaign.title,
        text: `Check out this campaign: ${campaign.title}`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Campaign link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share campaign");
    }
  };

  const handleFollow = async () => {
    // TODO This will need to be implemented with a database
    setIsFollowing((prev) => !prev);
    toast.success(isFollowing ? "Unfollowed campaign" : "Following campaign");
  };

  const remainingBalance =
    BigInt(campaign.amountCollected) - BigInt(campaign.withdrawnAmount);
  const showWithdraw = isOwner && remainingBalance > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Button
          variant={isFollowing ? "destructive" : "outline"}
          size="sm"
          onClick={handleFollow}
          className="flex-1"
        >
          {isFollowing ? (
            <>
              <HeartOff className="w-4 h-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>

      {showWithdraw && (
        <Button
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          variant="default"
          className="w-full"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Withdrawing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Withdraw {ethers.formatEther(remainingBalance)} ETH
            </>
          )}
        </Button>
      )}
    </div>
  );
}
