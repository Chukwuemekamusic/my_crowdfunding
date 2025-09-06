// utils/createCampaign.ts
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { handleContractError } from "./errorHandling";

export interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  target: string;
  deadline: string;
  image: File | null;
  imageUrl?: string;
  allowFlexibleWithdrawal: boolean;
}

interface CreateCampaignOptions {
  formData: CampaignFormData;
  contract: ethers.Contract;
  publishImmediately: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onImageUploadError?: () => void;
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

async function uploadImage(file: File): Promise<string> {
  const data = new FormData();
  data.set("file", file);

  const uploadRequest = await fetch("/api/files", {
    method: "POST",
    body: data,
  });

  if (!uploadRequest.ok) {
    throw new ImageUploadError("Failed to upload image");
  }

  const imageUrl = await uploadRequest.json();
  // Image upload success - no toast needed as it's part of campaign creation flow
  return imageUrl;
}

export async function createCampaign({
  formData,
  contract,
  publishImmediately,
  onSuccess,
  onError,
  onImageUploadError,
}: CreateCampaignOptions) {
  if (!contract) {
    throw new Error("Contract instance is required");
  }

  try {
    // Handle image upload if present
    let imageUrl = formData.imageUrl || ""; // Use existing URL if available
    if (formData.image) {
      try {
        imageUrl = await uploadImage(formData.image);
      } catch (error) {
        if (error instanceof ImageUploadError) {
          onImageUploadError?.();
          return;
        }
        throw error;
      }
    }

    // If publishing immediately and no image, prevent creation
    if (publishImmediately && !imageUrl) {
      toast.error("An image is required to publish a campaign");
      return;
    }

    // Prepare campaign input data
    const campaignInput = {
      title:
        formData.title ||
        (publishImmediately ? "Untitled Campaign" : "Untitled Draft"),
      description: formData.description || "",
      target: ethers.parseEther(formData.target || "0"),
      deadline: BigInt(
        Math.floor(new Date(formData.deadline).getTime() / 1000)
      ),
      image: imageUrl,
      category: Number(formData.category || "0"),
      allowFlexibleWithdrawal: formData.allowFlexibleWithdrawal,
    };

    // Create campaign on blockchain using appropriate function
    const tx = publishImmediately
      ? await contract.createPublishedCampaign(campaignInput)
      : await contract.createDraft(campaignInput);

    await tx.wait();

    // Toast notification will be handled by event listeners
    onSuccess?.();
  } catch (error: any) {
    const context = publishImmediately ? "create campaign" : "save draft";
    handleContractError(error, context);
    onError?.(error);
    throw error;
  }
}
