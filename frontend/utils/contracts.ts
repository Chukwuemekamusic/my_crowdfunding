// utils/contract.ts
import { Campaign } from "@/types/campaign";

/**
 * Processes a campaign from the contract's Proxy object format into a typed Campaign object
 * @param campaignData - Raw campaign data from contract
 * @returns Processed Campaign object
 */
export function processCampaign(campaignData: any): Campaign {
  return {
    id: Number(campaignData[0]),
    owner: campaignData[1],
    title: campaignData[2],
    description: campaignData[3],
    target: campaignData[4],
    deadline: campaignData[5],
    amountCollected: campaignData[6],
    withdrawnAmount: campaignData[7],
    image: campaignData[8],
    category: Number(campaignData[9]),
    status: Number(campaignData[10]),
    donorCount: Number(campaignData[11]),
    allowFlexibleWithdrawal: campaignData[12],
  };
}

/**
 * Processes an array of campaigns from the contract
 * @param campaignsData - Raw campaigns data from contract
 * @returns Array of processed Campaign objects
 */
export function processCampaigns(campaignsData: any[]): Campaign[] {
  return Array.from(campaignsData).map(processCampaign);
}

/**
 * Filters campaigns by owner address and status
 * @param campaigns - Array of campaigns
 * @param owner - Owner address to filter by
 * @param status - Status to filter by (optional)
 * @returns Filtered array of campaigns
 */
export function filterCampaignsByOwner(
  campaigns: Campaign[],
  owner: string,
  status?: number
): Campaign[] {
  return campaigns.filter(
    (campaign) =>
      campaign.owner === owner &&
      (status === undefined || campaign.status === status)
  );
}

/**
 * Formats a blockchain address for display
 * @param address - Full blockchain address
 * @returns Shortened address with ellipsis
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Checks if a campaign has expired
 * @param deadline - Campaign deadline timestamp
 * @returns boolean indicating if campaign has expired
 */
export function isCampaignExpired(deadline: bigint): boolean {
  return new Date(Number(deadline) * 1000) < new Date();
}

export const filterCampaignsByCategory = (
  campaigns: Campaign[],
  categoryId: number
): Campaign[] => {
  return campaigns.filter((campaign) => campaign.category === categoryId);
};

export const sortCampaigns = (
  campaigns: Campaign[],
  sortBy: string
): Campaign[] => {
  return [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return Number(a.deadline - b.deadline);
      case "amountCollected":
        return Number(b.amountCollected - a.amountCollected);
      case "recent":
        return b.id - a.id;
      default:
        return 0;
    }
  });
};

export const searchCampaigns = (
  campaigns: Campaign[],
  searchTerm: string
): Campaign[] => {
  const term = searchTerm.toLowerCase();
  return campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(term) ||
      campaign.description.toLowerCase().includes(term)
  );
};
