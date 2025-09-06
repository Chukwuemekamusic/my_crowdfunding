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
      <Card className={`hover:shadow-lg transition-all duration-300 ${
        status === 'active' || (!isExpired && !status)
          ? 'border-green-200 hover:border-green-300 hover:scale-[1.02]'
          : 'border-gray-200 opacity-90 hover:opacity-100'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <CardTitle className="line-clamp-2 text-base sm:text-lg leading-tight">
                {campaign.title}
              </CardTitle>
              <CardDescription className="line-clamp-3 mt-2 text-sm leading-relaxed">
                {campaign.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <Badge variant="outline" className="text-xs px-2 py-1 flex-shrink-0">
              {categories[campaign.category]}
            </Badge>
            <Badge
              variant={statusBadge.variant}
              className={`text-xs px-2 py-1 flex-shrink-0 ${statusBadge.className}`}
            >
              {statusBadge.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative h-40 sm:h-48 w-full mb-4 overflow-hidden rounded-lg">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover transition-transform hover:scale-105 duration-300"
              priority={false}
              sizes="(max-width: 640px) 95vw, (max-width: 768px) 48vw, (max-width: 1024px) 32vw, 25vw"
            />
          </div>
          <Progress
            value={progress}
            className={`h-2.5 rounded-full ${
              isFunded ? 'bg-blue-100' :
              status === 'active' || (!isExpired && !status) ? 'bg-green-100' : 'bg-gray-100'
            }`}
          />
          <div className="flex justify-between mt-3 text-sm">
            <span className="font-semibold text-foreground">
              {ethers.formatEther(campaign.amountCollected)} ETH
            </span>
            <span className="text-muted-foreground">
              of {ethers.formatEther(campaign.target)} ETH
            </span>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className="truncate pr-2">
              by <span className="font-mono">{campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}</span>
            </span>
            <span className="flex-shrink-0">
              {isExpired
                ? `Ended ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : `Ends ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              }
            </span>
          </div>
          {progress >= 100 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
              <span className="text-sm font-medium text-blue-700">
                🎉 Goal Reached!
              </span>
            </div>
          )}
          {/* Mobile-specific: Show progress percentage */}
          <div className="mt-2 sm:hidden">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
