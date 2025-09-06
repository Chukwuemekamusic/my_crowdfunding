// page without pagination
"use client";
import { useEffect, useState, useCallback } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import CampaignCard from "@/components/CampaignCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "All",
  "Technology",
  "Art",
  "Community",
  "Business",
  "Charity",
  "Other",
];

const statusOptions = [
  { value: "all", label: "All Campaigns" },
  { value: "active", label: "Active Campaigns" },
  { value: "completed", label: "Completed Campaigns" },
];

const sortOptions = [
  { value: "deadline", label: "Ending Soon" },
  { value: "amountCollected", label: "Most Funded" },
  { value: "recent", label: "Recently Added" },
];

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // Helper function to get the appropriate contract method based on status
  const getContractMethod = (statusFilter: string) => {
    switch (statusFilter) {
      case "active":
        return "getActiveCampaigns";
      case "completed":
        return "getCompletedCampaigns";
      default:
        return "getPublishedCampaigns";
    }
  };

  // Fetch campaigns with pagination
  const fetchCampaigns = useCallback(async (reset: boolean = false) => {
    if (!contract) {
      console.log("No contract instance available");
      setIsLoading(false);
      return;
    }

    try {
      if (reset) {
        setIsLoading(true);
        setPage(1);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const currentPage = reset ? 1 : page;
      const method = getContractMethod(status);

      console.log(`Fetching campaigns using ${method}, page ${currentPage}`);

      // Create pagination params
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const params = { offset, limit: ITEMS_PER_PAGE };

      const result = await contract[method](params);
      const [campaignsData, total] = result;

      console.log("Fetched campaigns:", campaignsData.length, "Total:", Number(total));

      if (reset) {
        setCampaigns(campaignsData);
      } else {
        setCampaigns(prev => [...prev, ...campaignsData]);
      }

      setTotalCampaigns(Number(total));
      setHasMore(campaignsData.length === ITEMS_PER_PAGE && (offset + campaignsData.length) < Number(total));

    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [contract, status, page]);

  // Initial fetch and when status changes
  useEffect(() => {
    if (contract) {
      fetchCampaigns(true);
    }
  }, [contract, status, fetchCampaigns]);

  // Load more campaigns
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
      fetchCampaigns(false);
    }
  };

  // Helper function to get campaign status
  const getCampaignStatus = (campaign: Campaign) => {
    const now = Date.now() / 1000;
    const isActive = Number(campaign.deadline) > now;
    const isFunded = Number(campaign.amountCollected) >= Number(campaign.target);

    if (isActive) return 'active';
    if (isFunded) return 'funded';
    return 'ended';
  };

  // Client-side filtering and sorting
  useEffect(() => {
    let filtered = [...campaigns];

    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter(
        (campaign) => categories[Number(campaign.category) + 1] === category
      );
    }

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
          return Number(a.deadline) - Number(b.deadline);
        case "amountCollected":
          return Number(b.amountCollected) - Number(a.amountCollected);
        case "recent":
          return Number(b.id) - Number(a.id); // Newer campaigns have higher IDs
        default:
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
  }, [category, search, campaigns, sortBy]);

  if (!contract) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!isConnected
              ? "Please connect your wallet to view campaigns"
              : "Unable to load contract. Please ensure you're on the correct network"}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Crowdfunding Campaigns</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            🧪 Demo
          </Badge>
        </div>
        <p className="text-muted-foreground mb-2">
          Experience the future of decentralized crowdfunding • {totalCampaigns} campaigns available
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 <strong>Try it out:</strong> Create campaigns, make donations, and explore Web3 functionality with test ETH
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:w-96"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Campaign status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
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
        <Select value={sortBy} onValueChange={setSortBy}>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading campaigns...</span>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <CampaignCard
                key={`${campaign.id}-${index}`}
                campaign={campaign}
                id={campaign.id}
                status={getCampaignStatus(campaign)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !search && category === "All" && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                size="lg"
                className="flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  `Load More Campaigns (${Math.min(ITEMS_PER_PAGE, totalCampaigns - campaigns.length)} remaining)`
                )}
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Showing {filteredCampaigns.length} of {totalCampaigns} campaigns
            {search || category !== "All" ? " (filtered)" : ""}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-4">
            {search || category !== "All" || status !== "all"
              ? "Try adjusting your filters to see more campaigns"
              : "This is a demo platform - create test campaigns to explore the features!"}
          </p>
          {!search && category === "All" && status === "all" && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🚀 <strong>Demo Tip:</strong> Connect your wallet and create a test campaign to see how the platform works!
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
