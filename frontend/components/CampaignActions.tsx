"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Heart, HeartOff, Send, Clock, Ban } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import { Campaign } from "@/types/campaign";
import { handleContractError } from "@/utils/errorHandling";

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
      // Toast notification will be handled by event listeners
    } catch (error: any) {
      handleContractError(error, "withdraw funds");
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
  const hasBalance = remainingBalance > 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const campaignEnded = Number(campaign.deadline) <= currentTime;
  const canWithdraw = campaign.allowFlexibleWithdrawal || campaignEnded;
  const showWithdraw = isOwner && hasBalance;

  // Withdrawal status messages
  const getWithdrawTooltip = () => {
    if (!hasBalance) return "No funds available to withdraw";
    if (!canWithdraw) {
      const deadlineDate = new Date(Number(campaign.deadline) * 1000).toLocaleDateString();
      return `Withdrawal available after campaign deadline: ${deadlineDate}`;
    }
    return "";
  };

  const getWithdrawButtonText = () => {
    if (!hasBalance) return "No Funds";
    if (!canWithdraw) {
      const deadlineDate = new Date(Number(campaign.deadline) * 1000).toLocaleDateString();
      return `Available ${deadlineDate}`;
    }
    return `Withdraw ${ethers.formatEther(remainingBalance)} ETH`;
  };

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !canWithdraw}
                  variant={canWithdraw ? "default" : "secondary"}
                  className="w-full"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      {canWithdraw ? (
                        <Send className="w-4 h-4 mr-2" />
                      ) : (
                        <Clock className="w-4 h-4 mr-2" />
                      )}
                      {getWithdrawButtonText()}
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {!canWithdraw && (
              <TooltipContent>
                <p>{getWithdrawTooltip()}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
