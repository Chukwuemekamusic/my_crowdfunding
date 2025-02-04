"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import CampaignCard from "@/components/CampaignCard";
import { Input } from "@/components/ui/input";
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
const sortOptions = [
  { value: "deadline", label: "Ending Soon" },
  { value: "amountCollected", label: "Most Funded" },
  { value: "recent", label: "Recently Added" },
];

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!contract) {
        console.log("No contract instance available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log("Contract instance:", contract.getAddress());
        console.log("Attempting to fetch campaigns...");
        const data = await contract.getPublishedCampaigns();

        console.log("Processed campaigns:", data);
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Failed to load campaigns. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [contract]);

  useEffect(() => {
    let filtered = [...campaigns];

    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter(
        (campaign) => categories[campaign.category] === category
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
          // Assuming newer campaigns have higher IDs
          return -1; // You might need to adjust this based on your data
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
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <CampaignCard key={index} campaign={campaign} id={index} />
          ))}
        </div>
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
