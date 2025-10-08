// components/dashboard/ActivityFeed.tsx
import { useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { graphqlClient } from "@/lib/graphql/client";
import { GET_USER_ACTIVITIES } from "@/lib/graphql/queries";
import type {
  GetUserActivitiesResponse,
  GetUserActivitiesVariables,
  Activity as ActivityType,
} from "@/lib/graphql/types";

interface ActivityItem {
  id: string;
  type:
    | "DONATION"
    | "WITHDRAWAL"
    | "PUBLISHED"
    | "CREATED"
    | "CANCELLED"
    | "UPDATED";
  campaignId: number;
  campaignTitle: string;
  amount?: string;
  fromAddress: string;
  timestamp: number;
}

export default function ActivityFeed({ address }: { address: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        setError(null);

        // Normalize address to lowercase for The Graph
        const normalizedAddress = address.toLowerCase();

        // Query The Graph for user-specific activities
        const data = await graphqlClient.request<
          GetUserActivitiesResponse,
          GetUserActivitiesVariables
        >(GET_USER_ACTIVITIES, {
          userAddress: normalizedAddress,
          first: 10,
        });

        // Transform GraphQL response to component format
        const transformedActivities: ActivityItem[] = data.activities.map(
          (activity: ActivityType) => ({
            id: activity.id,
            type: activity.type,
            campaignId: Number(activity.campaignId),
            campaignTitle: activity.campaignTitle,
            amount: activity.amount
              ? (Number(activity.amount) / 1e18).toFixed(4)
              : undefined,
            fromAddress: activity.user,
            timestamp: Number(activity.blockTimestamp),
          })
        );

        setActivities(transformedActivities);
      } catch (err) {
        console.error("Error fetching activities from subgraph:", err);
        setError("Failed to load activities");
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [address]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case "DONATION":
        return `${formatAddress(activity.fromAddress)} donated ${
          activity.amount
        } ETH to "${activity.campaignTitle}"`;
      case "WITHDRAWAL":
        return `${formatAddress(activity.fromAddress)} withdrew ${
          activity.amount
        } ETH from "${activity.campaignTitle}"`;
      case "PUBLISHED":
        return `${formatAddress(activity.fromAddress)} published "${
          activity.campaignTitle
        }"`;
      case "CREATED":
        return `${formatAddress(activity.fromAddress)} created "${
          activity.campaignTitle
        }"`;
      case "CANCELLED":
        return `${formatAddress(activity.fromAddress)} cancelled "${
          activity.campaignTitle
        }"`;
      case "UPDATED":
        return `${formatAddress(activity.fromAddress)} updated "${
          activity.campaignTitle
        }"`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 text-sm"
                >
                  <div className="min-w-[60px] text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                  <div className="flex-1">{getActivityMessage(activity)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No recent activity
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
