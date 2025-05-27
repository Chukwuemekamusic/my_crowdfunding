// utils/campaignActions.ts
import { ethers } from "ethers";
import toast from "react-hot-toast";

export const publishCampaign = async (
  campaignId: number,
  contract: ethers.Contract
) => {
  try {
    const campaign = await contract.getCampaign(campaignId, false);

    if (!campaign.image || campaign.image.trim() === "") {
      throw new Error("ImageRequired");
    }

    const tx = await contract.publishCampaign(campaignId);
    await tx.wait();

    return true;
  } catch (error: any) {
    if (
      error.message === "ImageRequired" ||
      error.reason?.includes("ImageRequired")
    ) {
      throw new Error("Please add an image before publishing");
    }
    console.error("Error publishing campaign:", error);
    throw new Error("Failed to publish campaign");
  }
};
