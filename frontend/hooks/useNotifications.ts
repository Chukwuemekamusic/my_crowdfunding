import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";

interface NotificationSummary {
  unreadCount: number;
  totalCount: number;
  hasNewDonations: boolean;
  hasDeadlineAlerts: boolean;
}

export function useNotifications() {
  const { contract, address, isConnected } = useWeb3();
  const [summary, setSummary] = useState<NotificationSummary>({
    unreadCount: 0,
    totalCount: 0,
    hasNewDonations: false,
    hasDeadlineAlerts: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState(180000); // Start with 3 minutes

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let eventListeners: (() => void)[] = [];

    const fetchNotificationSummary = async () => {
      if (!contract || !address || !isConnected) {
        setSummary({
          unreadCount: 0,
          totalCount: 0,
          hasNewDonations: false,
          hasDeadlineAlerts: false,
        });
        return;
      }

      try {
        setIsLoading(true);
        
        let unreadCount = 0;
        let totalCount = 0;
        let hasNewDonations = false;
        let hasDeadlineAlerts = false;

        // Get user's campaigns
        const userCampaigns = await contract.getUserCampaigns(address);
        
        for (const campaign of userCampaigns) {
          if (campaign.status === 1) { // Published campaigns only
            // Check for recent donations (reduced block range)
            try {
              const donationFilter = contract.filters.CampaignDonated(campaign.id);
              const recentEvents = await contract.queryFilter(donationFilter, -500); // Last 500 blocks
              
              if (recentEvents.length > 0) {
                hasNewDonations = true;
                unreadCount += Math.min(recentEvents.length, 3); // Max 3 per campaign
                totalCount += recentEvents.length;
              }
            } catch (error) {
              // Ignore errors for individual campaigns
            }

            // Check for deadline approaching
            const now = Date.now() / 1000;
            const deadline = Number(campaign.deadline);
            const hoursRemaining = (deadline - now) / 3600;

            if (hoursRemaining > 0 && hoursRemaining <= 168) { // Within 1 week
              hasDeadlineAlerts = true;
              unreadCount += 1;
              totalCount += 1;
            }

            // Check for milestones
            const progress = (Number(campaign.amountCollected) * 100) / Number(campaign.target);
            if (progress >= 100) {
              unreadCount += 1;
              totalCount += 1;
            } else if (progress >= 75) {
              unreadCount += 1;
              totalCount += 1;
            }
          }
        }

        const newSummary = {
          unreadCount: Math.min(unreadCount, 99), // Cap at 99 for display
          totalCount,
          hasNewDonations,
          hasDeadlineAlerts,
        };

        setSummary(newSummary);

        // Smart polling: if no activity, increase interval
        if (unreadCount === 0 && totalCount === 0) {
          setPollInterval(prev => Math.min(prev * 1.2, 600000)); // Max 10 minutes
        } else {
          setPollInterval(120000); // Reset to 2 minutes if activity
        }
      } catch (error) {
        console.error("Error fetching notification summary:", error);
        // On error, increase polling interval
        setPollInterval(prev => Math.min(prev * 1.5, 600000));
      } finally {
        setIsLoading(false);
      }
    };

    // Tab visibility handling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab inactive - increase interval
        setPollInterval(prev => Math.max(prev * 2, 300000)); // Min 5 minutes when hidden
      } else {
        // Tab active - reset to normal
        setPollInterval(120000); // 2 minutes when active
        fetchNotificationSummary(); // Immediate fetch when tab becomes active
      }
    };

    // Set up real-time event listeners for immediate updates
    const setupEventListeners = () => {
      if (!contract || !address) return;

      // Listen for donations to user's campaigns
      const onDonation = (campaignId: any, donor: any, amount: any) => {
        fetchNotificationSummary(); // Refresh immediately on new events
      };

      // Listen for campaign updates
      const onCampaignUpdated = (campaignId: any) => {
        fetchNotificationSummary();
      };

      contract.on("CampaignDonated", onDonation);
      contract.on("CampaignUpdated", onCampaignUpdated);
      contract.on("CampaignPublished", onCampaignUpdated);

      // Store cleanup functions
      eventListeners = [
        () => contract.off("CampaignDonated", onDonation),
        () => contract.off("CampaignUpdated", onCampaignUpdated),
        () => contract.off("CampaignPublished", onCampaignUpdated),
      ];
    };

    // Initial fetch
    fetchNotificationSummary();

    // Set up event listeners
    setupEventListeners();

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up smart polling interval
    const startPolling = () => {
      intervalId = setInterval(fetchNotificationSummary, pollInterval);
    };

    startPolling();

    return () => {
      clearInterval(intervalId);
      eventListeners.forEach(cleanup => cleanup());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [contract, address, isConnected, pollInterval]);

  return {
    ...summary,
    isLoading,
  };
}
