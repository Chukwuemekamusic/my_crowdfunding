// components/CampaignsList.tsx
"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import { filterAndSortCampaigns } from "@/utils/campaignFilters";
import CampaignCard from "@/components/CampaignCard";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPaginatedCampaigns } from "@/utils/pagination";

const ITEMS_PER_PAGE = 9;

const categories = [
  "All",
  "Technology",
  "Art",
  "Community",
  "Business",
  "Charity",
  "Other",
];

const sortOptions = [
  { value: "recent", label: "Recently Added" },
  { value: "deadline", label: "Ending Soon" },
  { value: "amountCollected", label: "Most Funded" },
];

export default function CampaignsList() {
  const { contract, isConnected } = useWeb3();
  const [rawCampaigns, setRawCampaigns] = useState<Campaign[]>([]);
  const [displayedCampaigns, setDisplayedCampaigns] = useState<Campaign[]>([]);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchCampaigns = async (reset: boolean = false, pageNum?: number) => {
    if (!contract) return;

    try {
      setIsLoading(reset);
      if (reset) {
        setIsInitializing(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : pageNum || page;

      console.log("Fetching campaigns...", { currentPage, reset });

      const result = await fetchPaginatedCampaigns(
        contract,
        "getPublishedCampaigns",
        currentPage,
        ITEMS_PER_PAGE
      );

      if (reset) {
        setRawCampaigns(result.campaigns);
      } else {
        setRawCampaigns((prev) => {
          const newCampaigns = result.campaigns.filter(
            (newCamp) =>
              !prev.some((existingCamp) => existingCamp.id === newCamp.id)
          );
          return [...prev, ...newCampaigns];
        });
      }

      setHasMore(result.hasMore);
      setError(null);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsInitializing(false);
    }
  };

  // Initial fetch when contract is available
  useEffect(() => {
    if (contract && isInitializing) {
      fetchCampaigns(true);
    }
  }, [contract]);

  // Handle filtering and sorting
  useEffect(() => {
    if (!isInitializing && rawCampaigns.length > 0) {
      const filtered = filterAndSortCampaigns(rawCampaigns, {
        search,
        sortBy,
        category,
      });
      setDisplayedCampaigns(filtered);
      /// Ensure no duplicates in displayed campaigns
      // const uniqueFiltered = filtered.filter((campaign, index, self) =>
      //     index === self.findIndex((c) => c.id === campaign.id)
      //   );

      //   setDisplayedCampaigns(uniqueFiltered);
    }
  }, [rawCampaigns, search, sortBy, category, isInitializing]);

  // Debounced search
  useEffect(() => {
    if (!isInitializing) {
      const timer = setTimeout(() => {
        const filtered = filterAndSortCampaigns(rawCampaigns, {
          search,
          sortBy,
          category,
        });
        setDisplayedCampaigns(filtered);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [search, isInitializing]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchCampaigns(false, nextPage);
  };

  if (!contract) {
    return (
      <div className="">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!isConnected
              ? "Please connect your wallet to view campaigns"
              : "Unable to load contract. Please ensure you're on the correct network"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-96"
          disabled={isInitializing}
        />
        <Select
          value={category}
          onValueChange={setCategory}
          disabled={isInitializing}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={setSortBy}
          disabled={isInitializing}
        >
          <SelectTrigger className="w-full md:w-48">
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

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isInitializing ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : displayedCampaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                id={Number(campaign.id)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground">
            {search || category !== "All"
              ? "Try adjusting your filters"
              : "Be the first to create a campaign!"}
          </p>
        </div>
      )}
    </div>
  );
}
