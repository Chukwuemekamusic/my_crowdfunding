import { ethers } from "ethers";
import CrowdFunding from "@/constants/CrowdFunding.json";
import type { Campaign } from "@/types/campaign";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

export async function fetchInitialCampaigns(): Promise<Campaign[]> {
  if (typeof window !== "undefined") {
    // Client-side: use BrowserProvider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS!,
      CrowdFunding.abi,
      provider
    );

    try {
      const result = await contract.getPublishedCampaigns({
        offset: 0,
        limit: 9,
      });
      return result[0];
    } catch (error) {
      console.error("Error fetching initial campaigns:", error);
      return [];
    }
  } else {
    // Server-side: return empty array for now
    return [];
  }
}
