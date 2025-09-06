"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import { Bell, BellRing, DollarSign, Target, Clock, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ethers } from "ethers";

interface Notification {
  id: string;
  type: 'donation_received' | 'milestone_reached' | 'deadline_approaching' | 'campaign_ended' | 'goal_achieved';
  campaignId: number;
  campaignTitle: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    amount?: string;
    donor?: string;
    milestone?: number;
    hoursRemaining?: number;
  };
}

// Helper function to format relative time
const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function NotificationsPage() {
  const { contract, address, isConnected } = useWeb3();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!contract || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const allNotifications: Notification[] = [];

        // Get user's campaigns
        const userCampaigns = await contract.getUserCampaigns(address);
        
        // Get followed campaigns (campaigns user has donated to)
        const followedCampaigns = await getFollowedCampaigns();

        // Process notifications for user's own campaigns
        for (const campaign of userCampaigns) {
          if (campaign.status === 1) { // Published campaigns only
            // Get donation events for this campaign
            const donationFilter = contract.filters.CampaignDonated(campaign.id);
            const donationEvents = await contract.queryFilter(donationFilter, -10000); // Last ~10k blocks

            // Create notifications for recent donations
            for (const event of donationEvents.slice(-5)) { // Last 5 donations
              const args = event.args;
              if (args) {
                // Get block timestamp for accurate time
                const block = await event.getBlock();
                const eventTimestamp = block ? block.timestamp * 1000 : Date.now();
                
                allNotifications.push({
                  id: `donation-${event.blockNumber}-${event.transactionIndex}`,
                  type: 'donation_received',
                  campaignId: Number(campaign.id),
                  campaignTitle: campaign.title,
                  message: `Received ${ethers.formatEther(args[2])} ETH donation`,
                  timestamp: eventTimestamp,
                  read: false, // Start as unread
                  data: {
                    amount: ethers.formatEther(args[2]),
                    donor: args[1],
                  },
                });
              }
            }

            // Check for milestone notifications
            const progress = (Number(campaign.amountCollected) * 100) / Number(campaign.target);
            const milestones = [25, 50, 75, 100];
            
            for (const milestone of milestones) {
              if (progress >= milestone) {
                const notificationId = `milestone-${campaign.id}-${milestone}`;
                if (!allNotifications.find(n => n.id === notificationId)) {
                  allNotifications.push({
                    id: notificationId,
                    type: milestone === 100 ? 'goal_achieved' : 'milestone_reached',
                    campaignId: Number(campaign.id),
                    campaignTitle: campaign.title,
                    message: milestone === 100 
                      ? `🎉 Campaign reached its funding goal!`
                      : `Campaign reached ${milestone}% of funding goal`,
                    timestamp: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
                    read: false,
                    data: { milestone },
                  });
                }
              }
            }

            // Check for deadline approaching
            const now = Date.now() / 1000;
            const deadline = Number(campaign.deadline);
            const hoursRemaining = (deadline - now) / 3600;

            if (hoursRemaining > 0 && hoursRemaining <= 168) { // Within 1 week
              let message = '';
              if (hoursRemaining <= 24) {
                message = `⏰ Campaign ends in ${Math.floor(hoursRemaining)} hours`;
              } else {
                const daysRemaining = Math.floor(hoursRemaining / 24);
                message = `📅 Campaign ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
              }

              allNotifications.push({
                id: `deadline-${campaign.id}`,
                type: 'deadline_approaching',
                campaignId: Number(campaign.id),
                campaignTitle: campaign.title,
                message,
                timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
                read: false,
                data: { hoursRemaining: Math.floor(hoursRemaining) },
              });
            } else if (hoursRemaining <= 0) {
              // Campaign ended
              allNotifications.push({
                id: `ended-${campaign.id}`,
                type: 'campaign_ended',
                campaignId: Number(campaign.id),
                campaignTitle: campaign.title,
                message: `Campaign has ended`,
                timestamp: deadline * 1000,
                read: Math.random() > 0.6,
                data: {},
              });
            }
          }
        }

        // Process notifications for followed campaigns
        for (const campaign of followedCampaigns) {
          const progress = (Number(campaign.amountCollected) * 100) / Number(campaign.target);
          
          if (progress >= 100) {
            allNotifications.push({
              id: `followed-goal-${campaign.id}`,
              type: 'goal_achieved',
              campaignId: Number(campaign.id),
              campaignTitle: campaign.title,
              message: `🎉 A campaign you supported reached its goal!`,
              timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
              read: false,
              data: {},
            });
          }
        }

        // Load read status from localStorage
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        allNotifications.forEach(notification => {
          if (readNotifications.includes(notification.id)) {
            notification.read = true;
          }
        });

        // Sort by timestamp (newest first)
        allNotifications.sort((a, b) => b.timestamp - a.timestamp);

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [contract, address]);

  // Helper function to get followed campaigns (reuse logic from Following page)
  const getFollowedCampaigns = async (): Promise<Campaign[]> => {
    if (!contract || !address) return [];

    try {
      const result = await contract.getPublishedCampaigns({ offset: 0, limit: 100 });
      const [allCampaigns] = result;
      const followedCampaigns: Campaign[] = [];

      for (const campaign of allCampaigns) {
        try {
          await contract.getDonorInfo(campaign.id, address);
          followedCampaigns.push(campaign);
        } catch {
          // User hasn't donated, skip
        }
      }

      return followedCampaigns;
    } catch {
      return [];
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
      // Persist read notifications to localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      // Persist all as read
      const allIds = updated.map(n => n.id);
      localStorage.setItem('readNotifications', JSON.stringify(allIds));
      return updated;
    });
  };

  const clearOldNotifications = () => {
    localStorage.removeItem('readNotifications');
    window.location.reload();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'donation_received':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'milestone_reached':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'goal_achieved':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'deadline_approaching':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'campaign_ended':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-center">
          Connect your wallet to see your notifications
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-primary" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on your campaigns and donations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearOldNotifications}>
            Clear cache
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading notifications...</span>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-background border-border' 
                  : 'bg-primary/5 border-primary/20'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {notification.campaignTitle}
                    </h3>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellRing className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'unread' 
              ? 'All caught up! Check back later for updates.'
              : 'When you create campaigns or receive donations, notifications will appear here.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
