"use client";
import { useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2, Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Campaign } from "@/types/campaign";
import { useWeb3 } from "@/hooks/useWeb3";
import toast from "react-hot-toast";

const categories = [
  "Technology",
  "Art",
  "Community",
  "Business",
  "Charity",
  "Other",
];

interface DraftCampaignCardProps {
  campaign: Campaign;
  id: number;
  onDelete?: () => void;
}

export default function DraftCampaignCard({
  campaign,
  id,
  onDelete,
}: DraftCampaignCardProps) {
  const router = useRouter();
  const { contract } = useWeb3();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    router.push(`/campaign/edit/${id}`);
  };

  const handlePublish = async () => {
    if (!contract) return;

    try {
      setIsPublishing(true);
      // TODO: ensure all parameters are ready
      const tx = await contract.publishCampaign(id);
      await tx.wait();
      onDelete?.();
      toast.success("Campaign published successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error publishing campaign:", error);
      toast.error("Failed to publish campaign");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!contract) return;

    try {
      setIsDeleting(true);
      const tx = await contract.cancelDraftCampaign(id);
      await tx.wait();
      toast.success("Draft deleted successfully!");
      onDelete?.();
      router.refresh();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {campaign.description}
              </CardDescription>
            </div>
            <Badge variant="secondary">{categories[campaign.category]}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-48 w-full mb-4">
            <Image
              src={campaign.image || "/placeholder.jpg"}
              alt={campaign.title}
              fill
              className="object-cover rounded"
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Target: {ethers.formatEther(campaign.target)} ETH</span>
            <span>
              Deadline:{" "}
              {new Date(Number(campaign.deadline) * 1000).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="w-full" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              draft campaign.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
