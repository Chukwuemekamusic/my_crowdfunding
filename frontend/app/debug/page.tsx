"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Campaign } from "@/types/campaign";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to convert BigInt values to strings
const convertBigIntToString = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertBigIntToString(obj[key]);
      }
    }
    return converted;
  }

  return obj;
};

export default function DebugPage() {
  const { contract, isConnected, address } = useWeb3();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (contract) {
      // Get contract address
      contract.getAddress().then(setContractAddress).catch(console.error);
      debugContract();
    }
  }, [contract]);

  const debugContract = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      setError(null);
      const debug: any = {};

      // Get campaign count
      const count = await contract.campaignCount();
      console.log("Campaign count:", count.toString());
      debug.campaignCount = count.toString();

      // Try getting all campaigns first
      console.log("Getting all campaigns...");
      const allCampaigns = await contract.getCampaigns();
      console.log("All campaigns:", allCampaigns);
      debug.allCampaigns = convertBigIntToString(allCampaigns);

      // Try regular published campaigns
      console.log("Trying getPublishedCampaigns2...");
      const campaigns2 = await contract.getPublishedCampaigns2();
      console.log("Published campaigns (method 2):", campaigns2);
      debug.publishedCampaigns2 = convertBigIntToString(campaigns2);

      // Try paginated version
      try {
        const params = { offset: 0, limit: 10 };
        console.log("Trying paginated getPublishedCampaigns...");
        const paginatedCampaigns = await contract.getPublishedCampaigns(params);
        console.log("Paginated campaigns:", paginatedCampaigns);
        debug.paginatedCampaigns = convertBigIntToString(paginatedCampaigns);
      } catch (e: any) {
        console.log("Error with paginated campaigns:", e);
        debug.paginatedError = e.message;
      }

      // Add contract info
      debug.contractAddress = contractAddress;
      debug.userAddress = address;

      setDebugInfo(debug);
    } catch (error: any) {
      console.error("Debug error:", error);
      setError(error.message || "Failed to debug contract");
      setDebugInfo((prev: any) => ({
        ...prev,
        error: error.message || "Unknown error",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!contract) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!isConnected
              ? "Please connect your wallet to debug"
              : "Unable to load contract. Please ensure you're on the correct network"}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Contract Debug Page</h1>

      <div className="mb-4">
        <p>
          <strong>Connected Address:</strong> {address}
        </p>
        <p>
          <strong>Contract Address:</strong> {contractAddress}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Debug Info:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <Button onClick={debugContract} className="mt-4">
            Refresh Debug Info
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </main>
  );
}
