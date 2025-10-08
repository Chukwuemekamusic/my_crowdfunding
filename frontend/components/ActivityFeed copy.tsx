// components/dashboard/ActivityFeed.tsx
import { useEffect, useState } from "react";
import { ethers, type EventLog, type Log } from "ethers";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityItem {
  id: string;
  type: "donation" | "withdrawal" | "publish";
  campaignId: number;
  campaignTitle: string;
  amount?: string;
  fromAddress: string;
  timestamp: number;
}

function decodeEventData(event: Log, contract: ethers.Contract) {
  if (!contract.interface) return null;

  try {
    const donatedEvent = contract.interface.getEvent("CampaignDonated");
    const withdrawnEvent = contract.interface.getEvent("FundsWithdrawn");
    const publishedEvent = contract.interface.getEvent("CampaignPublished");

    if (!donatedEvent || !withdrawnEvent || !publishedEvent) return null;

    // Get the decoded data based on event topic (signature)
    const eventTopic = event.topics[0];

    if (eventTopic === donatedEvent.topicHash) {
      const decoded = contract.interface.decodeEventLog(
        "CampaignDonated",
        event.data,
        event.topics
      );
      return {
        campaignId: decoded.id,
        donator: decoded.donator,
        amount: decoded.amount,
      };
    }

    if (eventTopic === withdrawnEvent.topicHash) {
      const decoded = contract.interface.decodeEventLog(
        "FundsWithdrawn",
        event.data,
        event.topics
      );
      return {
        campaignId: decoded.id,
        owner: decoded.owner,
        amount: decoded.amount,
      };
    }

    if (eventTopic === publishedEvent.topicHash) {
      const decoded = contract.interface.decodeEventLog(
        "CampaignPublished",
        event.data,
        event.topics
      );
      return {
        campaignId: decoded.id,
        owner: decoded.owner,
      };
    }

    return null;
  } catch (error) {
    console.error("Error decoding event:", error);
    return null;
  }
}

async function processDonationEvent(
  event: Log,
  contract: ethers.Contract
): Promise<ActivityItem | null> {
  try {
    const decoded = decodeEventData(event, contract);
    if (!decoded) return null;

    const campaign = await contract.campaigns(decoded.campaignId);
    return {
      id: `${event.blockNumber}-${event.transactionIndex}`,
      type: "donation",
      campaignId: Number(decoded.campaignId),
      campaignTitle: campaign.title,
      amount: ethers.formatEther(decoded.amount),
      fromAddress: decoded.donator,
      timestamp: (await event.getBlock()).timestamp,
    };
  } catch (error) {
    console.error("Error processing donation event:", error);
    return null;
  }
}

async function processWithdrawalEvent(
  event: Log,
  contract: ethers.Contract
): Promise<ActivityItem | null> {
  try {
    const decoded = decodeEventData(event, contract);
    if (!decoded) return null;

    const campaign = await contract.campaigns(decoded.campaignId);
    return {
      id: `${event.blockNumber}-${event.transactionIndex}`,
      type: "withdrawal",
      campaignId: Number(decoded.campaignId),
      campaignTitle: campaign.title,
      amount: ethers.formatEther(decoded.amount),
      fromAddress: decoded.owner,
      timestamp: (await event.getBlock()).timestamp,
    };
  } catch (error) {
    console.error("Error processing withdrawal event:", error);
    return null;
  }
}

async function processPublishEvent(
  event: Log,
  contract: ethers.Contract
): Promise<ActivityItem | null> {
  try {
    const decoded = decodeEventData(event, contract);
    if (!decoded) return null;

    const campaign = await contract.campaigns(decoded.campaignId);
    return {
      id: `${event.blockNumber}-${event.transactionIndex}`,
      type: "publish",
      campaignId: Number(decoded.campaignId),
      campaignTitle: campaign.title,
      fromAddress: decoded.owner,
      timestamp: (await event.getBlock()).timestamp,
    };
  } catch (error) {
    console.error("Error processing publish event:", error);
    return null;
  }
}

export default function ActivityFeed({
  contract,
  address,
}: {
  contract: ethers.Contract;
  address: string;
}) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!contract || !address) return;

      try {
        setIsLoading(true);

        const provider = await contract.runner?.provider;
        if (!provider) throw new Error("No provider available");

        const latestBlock = await provider.getBlockNumber();
        // Reduce the block range to last 1000 blocks (about 4 hours on Ethereum)
        // Adjust this number based on your needs and network
        const fromBlock = Math.max(0, latestBlock - 1000);

        try {
          // Get events
          const [donations, withdrawals, publications] = await Promise.all([
            contract.queryFilter(
              contract.filters.CampaignDonated(),
              fromBlock,
              latestBlock
            ),
            contract.queryFilter(
              contract.filters.FundsWithdrawn(),
              fromBlock,
              latestBlock
            ),
            contract.queryFilter(
              contract.filters.CampaignPublished(),
              fromBlock,
              latestBlock
            ),
          ]);

          // Process events into activities
          const allActivities = await Promise.all([
            ...donations.map((event) => processDonationEvent(event, contract)),
            ...withdrawals.map((event) =>
              processWithdrawalEvent(event, contract)
            ),
            ...publications.map((event) =>
              processPublishEvent(event, contract)
            ),
          ]);

          // Filter out null values and sort by timestamp
          const sortedActivities = allActivities
            .filter((activity): activity is ActivityItem => activity !== null)
            .sort((a, b) => b.timestamp - a.timestamp);

          // Only take the last 10 activities
          setActivities(sortedActivities.slice(0, 10));
        } catch (error: any) {
          // Handle specific provider errors
          if (
            error.code === "INVALID_ARGUMENT" ||
            error.code === "NUMERIC_FAULT"
          ) {
            console.error("Error with block range:", error);
            // Try with an even smaller range if needed
            const smallerFromBlock = Math.max(0, latestBlock - 100);

            const [donations, withdrawals, publications] = await Promise.all([
              contract.queryFilter(
                contract.filters.CampaignDonated(),
                smallerFromBlock,
                latestBlock
              ),
              contract.queryFilter(
                contract.filters.FundsWithdrawn(),
                smallerFromBlock,
                latestBlock
              ),
              contract.queryFilter(
                contract.filters.CampaignPublished(),
                smallerFromBlock,
                latestBlock
              ),
            ]);

            // Process events into activities
            const allActivities = await Promise.all([
              ...donations.map((event) =>
                processDonationEvent(event, contract)
              ),
              ...withdrawals.map((event) =>
                processWithdrawalEvent(event, contract)
              ),
              ...publications.map((event) =>
                processPublishEvent(event, contract)
              ),
            ]);

            // Filter out null values and sort by timestamp
            const sortedActivities = allActivities
              .filter((activity): activity is ActivityItem => activity !== null)
              .sort((a, b) => b.timestamp - a.timestamp);

            setActivities(sortedActivities.slice(0, 10));
          } else {
            throw error; // Re-throw other errors
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]); // Set empty activities on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [contract, address]);

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
      case "donation":
        return `${formatAddress(activity.fromAddress)} donated ${
          activity.amount
        } ETH to "${activity.campaignTitle}"`;
      case "withdrawal":
        return `${formatAddress(activity.fromAddress)} withdrew ${
          activity.amount
        } ETH from "${activity.campaignTitle}"`;
      case "publish":
        return `${formatAddress(activity.fromAddress)} published "${
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
