// utils/campaign.ts
import { ethers } from "ethers";
import toast from "react-hot-toast";

export interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  target: string;
  deadline: string;
  image: File | null;
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
  toast.success("Image uploaded successfully");
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
    let imageUrl = "";
    if (formData.image) {
      try {
        imageUrl = await uploadImage(formData.image);
      } catch (error) {
        if (error instanceof ImageUploadError) {
          onImageUploadError?.();
          return; // Exit early if image upload fails
        }
        throw error; // Rethrow other errors
      }
    }

    // Prepare campaign input data
    const deadline = formData.deadline
      ? Math.floor(new Date(formData.deadline).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    const campaignInput = {
      title:
        formData.title ||
        (publishImmediately ? "Untitled Campaign" : "Untitled Draft"),
      description: formData.description || "",
      target: formData.target
        ? ethers.parseEther(formData.target)
        : ethers.parseEther("0"),
      deadline: BigInt(deadline),
      image: imageUrl,
      category: parseInt(formData.category || "0"),
      publishImmediately,
      allowFlexibleWithdrawal: formData.allowFlexibleWithdrawal,
    };

    // Create campaign on blockchain
    const tx = await contract.createCampaign(campaignInput);
    await tx.wait();

    toast.success(
      `Campaign ${
        publishImmediately ? "created" : "saved as draft"
      } successfully`
    );

    onSuccess?.();
  } catch (error) {
    console.error("Error creating campaign:", error);
    toast.error(
      `Failed to ${
        publishImmediately ? "create campaign" : "save draft"
      }. Please try again.`
    );
    onError?.(error);
    throw error;
  }
}
