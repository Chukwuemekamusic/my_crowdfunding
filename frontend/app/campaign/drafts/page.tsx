import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Pencil, Trash, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DraftsPage() {
  const router = useRouter();
  const { contract, address } = useWeb3();
  const [drafts, setDrafts] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, [contract, address]);

  const fetchDrafts = async () => {
    if (!contract || !address) return;

    try {
      setIsLoading(true);
      const drafts = await contract.getUserDraftCampaigns(address);
      setDrafts(drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      toast.error("Failed to load drafts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (draftId: number) => {
    router.push(`/campaign/edit/${draftId}`);
  };

  const handlePublish = async (draftId: number) => {
    if (!contract) return;

    try {
      setIsProcessing(draftId);
      const tx = await contract.publishCampaign(draftId);
      await tx.wait();

      toast.success("Campaign published successfully");
      await fetchDrafts();
    } catch (error) {
      console.error("Error publishing campaign:", error);
      toast.error("Failed to publish campaign");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (draftId: number) => {
    if (!contract) return;

    try {
      setIsProcessing(draftId);
      const tx = await contract.cancelDraftCampaign(draftId);
      await tx.wait();

      toast.success("Draft deleted successfully");
      await fetchDrafts();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    } finally {
      setIsProcessing(null);
    }
  };

  if (!contract || !address) {
    return (
      <div className="text-center py-12">
        Please connect your wallet to view drafts
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Draft Campaigns</h1>
        <Button onClick={() => router.push("/campaign/create")}>
          Create New Campaign
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <p className="text-muted-foreground mb-4">No draft campaigns yet</p>
            <Button onClick={() => router.push("/campaign/create")}>
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">
                      {draft.title || "Untitled Draft"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {draft.description || "No description yet"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(draft.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublish(draft.id)}>
                        <Upload className="mr-2 h-4 w-4" /> Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(draft.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date(Number(draft.deadline) * 1000).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleEdit(draft.id)}
                  disabled={isProcessing === draft.id}
                >
                  {isProcessing === draft.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue Editing"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
