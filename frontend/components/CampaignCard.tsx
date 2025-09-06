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
  status,
}: {
  campaign: Campaign;
  id: number;
  status?: string;
}) {
  // if (!campaign) {
  //   return null; // or return a placeholder/skeleton
  // }

  const progress = Number(
    (BigInt(campaign.amountCollected) * BigInt(100)) / BigInt(campaign.target)
  );
  const deadline = new Date(Number(campaign.deadline) * 1000);
  const isExpired = deadline < new Date();
  const isFunded = Number(campaign.amountCollected) >= Number(campaign.target);

  const categories = [
    "Technology",
    "Art",
    "Community",
    "Business",
    "Charity",
    "Other",
  ];

  // Get status badge properties
  const getStatusBadge = () => {
    if (status === 'active' || (!isExpired && !status)) {
      return { variant: "default" as const, text: "🟢 Active", className: "bg-green-100 text-green-800 border-green-200" };
    } else if (status === 'funded' || (isExpired && isFunded)) {
      return { variant: "default" as const, text: "✅ Funded", className: "bg-blue-100 text-blue-800 border-blue-200" };
    } else {
      return { variant: "secondary" as const, text: "⏰ Ended", className: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Link href={`/campaign/${id}`}>
      <Card className={`hover:shadow-lg transition-shadow ${
        status === 'active' || (!isExpired && !status)
          ? 'border-green-200 hover:border-green-300'
          : 'border-gray-200 opacity-90'
      }`}>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {campaign.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {categories[campaign.category]}
            </Badge>
            <Badge
              variant={statusBadge.variant}
              className={`text-xs ${statusBadge.className}`}
            >
              {statusBadge.text}
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
          <Progress
            value={progress}
            className={`h-2 ${
              isFunded ? 'bg-blue-100' :
              status === 'active' || (!isExpired && !status) ? 'bg-green-100' : 'bg-gray-100'
            }`}
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className="font-medium">
              {ethers.formatEther(campaign.amountCollected)} ETH
            </span>
            <span className="text-muted-foreground">
              of {ethers.formatEther(campaign.target)} ETH
            </span>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>
              by {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
            </span>
            <span>
              {isExpired
                ? `Ended ${deadline.toLocaleDateString()}`
                : `Ends ${deadline.toLocaleDateString()}`
              }
            </span>
          </div>
          {progress >= 100 && (
            <div className="mt-2 text-xs font-medium text-blue-600">
              🎉 Goal Reached!
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
