// CampaignCard.tsx
"use client";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CampaignCard({ campaign }: { campaign: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign.title}</CardTitle>
        <CardDescription className="truncate">
          {campaign.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <img
          src={`https://ipfs.io/ipfs/${campaign.image}`}
          alt={campaign.title}
          className="h-48 w-full object-cover rounded"
        />
        <div className="mt-4">
          <Progress
            value={
              (Number(campaign.currentBalance) / Number(campaign.target)) * 100
            }
          />
          <div className="flex justify-between mt-2">
            <span>{ethers.formatEther(campaign.currentBalance)} ETH</span>
            <span>{ethers.formatEther(campaign.target)} ETH</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
