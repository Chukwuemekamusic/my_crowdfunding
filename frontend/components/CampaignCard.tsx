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
import { Badge } from "./ui/badge";
import Image from "next/image";
import Link from "next/link";

import { Campaign } from "@/types/campaign";

export default function CampaignCard({
  campaign,
  id,
}: {
  campaign: Campaign;
  id: number;
}) {
  // if (!campaign) {
  //   return null; // or return a placeholder/skeleton
  // }

  const progress = Number(
    (BigInt(campaign.amountCollected) * BigInt(100)) / BigInt(campaign.target)
  );
  const deadline = new Date(Number(campaign.deadline) * 1000);
  const isExpired = deadline < new Date();
  const categories = [
    "Technology",
    "Art",
    "Community",
    "Business",
    "Charity",
    "Other",
  ];

  return (
    <Link href={`/campaign/${id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {campaign.description}
              </CardDescription>
            </div>
            <Badge variant={isExpired ? "destructive" : "secondary"}>
              {categories[campaign.category]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-48 w-full mb-4">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover rounded"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span>
              {ethers.formatEther(campaign.amountCollected)} ETH raised
            </span>
            <span>{ethers.formatEther(campaign.target)} ETH goal</span>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>
              by {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
            </span>
            <span>
              {isExpired ? "Ended" : `Ends ${deadline.toLocaleDateString()}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
