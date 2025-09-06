// utils/campaignActions.ts
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { handleContractError } from "./errorHandling";

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
    handleContractError(error, "publish campaign");
    throw error;
  }
};
