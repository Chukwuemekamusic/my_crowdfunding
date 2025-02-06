// page with pagination
"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
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
  { value: "deadline", label: "Ending Soon" },
  { value: "amountCollected", label: "Most Funded" },
  { value: "recent", label: "Recently Added" },
];

const ITEMS_PER_PAGE = 9; // Number of items to show per page

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchCampaigns(true);
    }
  }, [contract, category, sortBy]);

  const fetchCampaigns = async (reset: boolean = false) => {
    if (!contract) return;

    try {
      setIsLoading(reset);
      setError(null);
      const currentPage = reset ? 1 : page;

      let method = "getPublishedCampaigns";
      let args: any[] = [];

      if (category !== "All") {
        method = "getCampaignsByCategory";
        args.push(categories.indexOf(category) - 1);
      }

      //   console.log("Fetching campaigns...", {
      //     method,
      //     currentPage,
      //     category,
      //     args,
      //   });

      const result = await fetchPaginatedCampaigns(
        contract,
        method,
        currentPage,
        ITEMS_PER_PAGE,
        ...args
      );

      console.log("Processed result:", result);

      // Apply search filter
      let filteredCampaigns = [...result.campaigns];
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

      if (reset) {
        setCampaigns(filteredCampaigns);
        setPage(1);
      } else {
        setCampaigns((prev) => [...prev, ...filteredCampaigns]);
      }

      setTotalCampaigns(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
    await fetchCampaigns(false);
  };

  // Reset and fetch when filters change
  useEffect(() => {
    if (contract) {
      const timer = setTimeout(() => {
        fetchCampaigns(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, category, sortBy]);

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
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-96"
        />
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
        </div>
      ) : campaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} id={index} />
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
    </main>
  );
}
