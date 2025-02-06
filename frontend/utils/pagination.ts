// utils/pagination.ts
import { Campaign } from "@/types/campaign";
import { ethers } from "ethers";

export interface PaginationParams {
  offset: number;
  limit: number;
}

export interface PaginatedResult {
  campaigns: Campaign[];
  total: number;
  hasMore: boolean;
}

export async function fetchPaginatedCampaigns(
  contract: ethers.Contract,
  method: string,
  page: number = 1,
  pageSize: number = 9,
  ...args: any[]
): Promise<PaginatedResult> {
  try {
    const offset = (page - 1) * pageSize;
    const params: PaginationParams = {
      offset,
      limit: pageSize,
    };

    // TODO: Comment out later!
    console.log("Contract method being called:", method);
    console.log("Parameters:", { params, args });

    const result =
      args.length > 0
        ? await contract[method](...args, params)
        : await contract[method](params);

    console.log("Raw contract response:", result);

    // Extract campaigns and total from the response
    // The response is [campaigns[], total]
    const [campaignsData, total] = result;

    // Handle the case where campaignsData might be nested
    const flatCampaigns = Array.isArray(campaignsData[0])
      ? campaignsData
      : [campaignsData];

    return {
      campaigns: flatCampaigns,
      total: Number(total),
      hasMore: offset + flatCampaigns.length < Number(total),
    };
  } catch (error) {
    console.error("Error in fetchPaginatedCampaigns:", error);
    throw error;
  }
}
