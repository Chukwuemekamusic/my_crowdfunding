import { ethers } from "ethers";
import CampaignCard from "@/components/CampaignCard";
import WalletConnector from "@/components/WalletConnector";

async function getCampaigns(contract: ethers.Contract) {
  return await contract.getPublishedCampaigns();
}

export default function Home() {
  // In real implementation, use state management for contract instance
  return (
    <main className="container mx-auto p-4">
      <WalletConnector />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">Hello</div>
    </main>
  );
}
