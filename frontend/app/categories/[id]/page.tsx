// app/categories/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Campaign } from "@/types/campaign";
import { useWeb3 } from "@/hooks/useWeb3";
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
import { processCampaigns } from "@/utils/contracts";

const ITEMS_PER_PAGE = 9;

const categories = [
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

export default function CategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { contract } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [displayedCampaigns, setDisplayedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Validate category ID
  useEffect(() => {
    const categoryId = Number(id);
    if (categoryId < 0 || categoryId > 5 || isNaN(categoryId)) {
      router.push("/categories");
    }
  }, [id, router]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!contract) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get campaigns by category
        const campaignResult = await contract.getCampaignsByCategory(
          Number(id)
        );
        console.log("categoryCampaigns", campaignResult);
        const categoryCampaigns = processCampaigns(campaignResult);

        setCampaigns(categoryCampaigns);
        setFilteredCampaigns(categoryCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Failed to load campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [contract, id]);

  // Filter and sort campaigns
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
          return Number(a.deadline) - Number(b.deadline);
        case "amountCollected":
          return Number(b.amountCollected) - Number(a.amountCollected);
        case "recent":
          return Number(b.id) - Number(a.id);
        default:
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
    setPage(1); // Reset pagination when filters change
  }, [campaigns, search, sortBy]);

  // Handle pagination
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    setDisplayedCampaigns(paginatedCampaigns);
    setHasMore(endIndex < filteredCampaigns.length);
  }, [filteredCampaigns, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = [...campaigns];
      if (search) {
        filtered = filtered.filter(
          (campaign) =>
            campaign.title.toLowerCase().includes(search.toLowerCase()) ||
            campaign.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      setFilteredCampaigns(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, campaigns]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {categories[Number(id)]} Campaigns
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse and support {categories[Number(id)].toLowerCase()} projects.
        </p>
      </div>

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
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
              <Button onClick={loadMore} variant="outline" size="lg">
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
              : `Be the first to create a ${categories[
                  Number(id)
                ].toLowerCase()} campaign!`}
          </p>
        </div>
      )}
    </div>
  );
}
