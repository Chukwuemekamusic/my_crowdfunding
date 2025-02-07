// utils/campaignFilters.ts
import { Campaign } from "@/types/campaign";
import { categories } from "@/lib/utils";

export const filterAndSortCampaigns = (
  campaigns: Campaign[],
  {
    search,
    sortBy,
    category,
  }: {
    search: string;
    sortBy: string;
    category: string;
  }
) => {
  let filteredCampaigns = [...campaigns];

  // Apply category filter
  if (category !== "All") {
    filteredCampaigns = filteredCampaigns.filter(
      (campaign) => categories[Number(campaign.category) + 1] === category
    );
  }

  // Apply search filter
  if (search) {
    filteredCampaigns = filteredCampaigns.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(search.toLowerCase()) ||
        campaign.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply sorting
  filteredCampaigns.sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return Number(a.deadline) - Number(b.deadline);
      case "amountCollected":
        return Number(b.amountCollected) - Number(a.amountCollected);
      case "recent":
        return Number(b.id) - Number(a.id);
      default:
        return 0;
    }
  });

  return filteredCampaigns;
};
