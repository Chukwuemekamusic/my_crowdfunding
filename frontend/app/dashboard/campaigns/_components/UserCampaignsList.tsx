"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { processCampaigns, filterCampaignsByOwner } from "@/utils/contracts";
import { Campaign } from "@/types/campaign";
import CampaignCard from "@/components/CampaignCard";
import DraftCampaignCard from "@/components/DraftCampaignCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserCampaignsListProps {
  status?: "published" | "draft";
  showFilters?: boolean;
}

const ITEMS_PER_PAGE = 6;

const sortOptions = [
  { value: "deadline", label: "Ending Soon" },
  { value: "amountCollected", label: "Most Funded" },
  { value: "recent", label: "Recently Added" },
];

function processCampaign(campaignData: any): Campaign {
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

export default function UserCampaignsList({
  status = "published",
  showFilters = true,
}: UserCampaignsListProps) {
  const { contract, address } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!contract || !address) return;

      try {
        setIsLoading(true);
        setError(null);

        let userCampaigns;
        if (status === "draft") {
          const drafts = await contract.getUserDraftCampaigns(address);
          userCampaigns = processCampaigns(drafts);
        } else {
          const allCampaigns = await contract.getCampaigns();
          const processed = processCampaigns(allCampaigns);
          userCampaigns = filterCampaignsByOwner(processed, address, 1);
        }

        setCampaigns(userCampaigns);
        setFilteredCampaigns(userCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Failed to load campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [contract, address, status]);

  useEffect(() => {
    let filtered = [...campaigns];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(search.toLowerCase()) ||
          campaign.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
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

    setFilteredCampaigns(filtered);
  }, [campaigns, search, sortBy]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
    if (page * ITEMS_PER_PAGE >= filteredCampaigns.length) {
      setHasMore(false);
    }
  };

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
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-96"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.slice(0, page * ITEMS_PER_PAGE).map((campaign) =>
              status === "draft" ? (
                <DraftCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  id={campaign.id}
                  onDelete={() => {
                    const newCampaigns = campaigns.filter(
                      (c) => c.id !== campaign.id
                    );
                    setCampaigns(newCampaigns);
                    setFilteredCampaigns(newCampaigns);
                  }}
                />
              ) : (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  id={campaign.id}
                />
              )
            )}
          </div>

          {hasMore && filteredCampaigns.length > page * ITEMS_PER_PAGE && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground">
            {search
              ? "Try adjusting your search"
              : `You don't have any ${status} campaigns yet`}
          </p>
        </div>
      )}
    </div>
  );
}
