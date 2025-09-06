"use client";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { Web3Context } from "./web3Context";
import CrowdFunding from "@/constants/CrowdFunding.json";
import toast from "react-hot-toast";
import { validateNetwork } from "@/utils/errorHandling";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toast deduplication - prevent duplicate toasts for the same transaction
  const [recentToasts, setRecentToasts] = useState<Set<string>>(new Set());

  const connect = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
      console.log("No ethereum object found");
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      console.log("Attempting to connect...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider created:", provider);

      const signer = await provider.getSigner();
      console.log("Signer obtained:", signer);

      const address = await signer.getAddress();
      console.log("Address obtained:", address);

      const network = await provider.getNetwork();
      console.log("Network info:", network);

      const networkChainId = Number(network.chainId);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS!,
        CrowdFunding.abi,
        signer
      );
      console.log("Contract instance created:", contract);

      setAddress(address);
      setSigner(signer);
      setContract(contract);
      setChainId(networkChainId);

      // Validate network
      await validateNetwork(networkChainId);

      toast.success("Wallet connected successfully");
      setIsConnected(true);
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect wallet");
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    setIsConnected(false);
  };

  // Helper function to show toast with deduplication
  const showToast = useCallback((message: string, txHash?: string) => {
    const toastKey = txHash ? `${txHash}-${message}` : message;

    if (!recentToasts.has(toastKey)) {
      toast.success(message);
      setRecentToasts(prev => new Set([...prev, toastKey]));

      // Clear the toast key after 5 seconds to allow future toasts
      setTimeout(() => {
        setRecentToasts(prev => {
          const newSet = new Set(prev);
          newSet.delete(toastKey);
          return newSet;
        });
      }, 5000);
    }
  }, [recentToasts]);

  // Event handlers for contract events
  const handleCampaignCreated = useCallback((id: bigint, owner: string, title: string, event: any) => {
    // Only show toast for events from current user
    if (owner.toLowerCase() === address?.toLowerCase()) {
      console.log("Campaign created:", { id: Number(id), owner, title });
      showToast(`Campaign "${title}" created successfully!`, event.transactionHash);
    }
  }, [address, showToast]);

  const handleCampaignDonated = useCallback((id: bigint, donator: string, amount: bigint, event: any) => {
    // Only show toast for donations from current user
    if (donator.toLowerCase() === address?.toLowerCase()) {
      console.log("Campaign donation:", { id: Number(id), donator, amount: ethers.formatEther(amount) });
      showToast(`Donation of ${ethers.formatEther(amount)} ETH successful!`, event.transactionHash);
    }
  }, [address, showToast]);

  const handleCampaignPublished = useCallback((id: bigint, owner: string, event: any) => {
    // Only show toast for campaigns published by current user
    if (owner.toLowerCase() === address?.toLowerCase()) {
      console.log("Campaign published:", { id: Number(id), owner });
      showToast("Campaign published successfully!", event.transactionHash);
    }
  }, [address, showToast]);

  const handleFundsWithdrawn = useCallback((id: bigint, owner: string, amount: bigint, event: any) => {
    // Only show toast for withdrawals by current user
    if (owner.toLowerCase() === address?.toLowerCase()) {
      console.log("Funds withdrawn:", { id: Number(id), owner, amount: ethers.formatEther(amount) });
      showToast(`${ethers.formatEther(amount)} ETH withdrawn successfully!`, event.transactionHash);
    }
  }, [address, showToast]);

  // Set up contract event listeners
  useEffect(() => {
    if (contract && isConnected) {
      console.log("Setting up contract event listeners...");

      // Remove any existing listeners first to prevent duplicates
      contract.removeAllListeners("CampaignCreated");
      contract.removeAllListeners("CampaignDonated");
      contract.removeAllListeners("CampaignPublished");
      contract.removeAllListeners("FundsWithdrawn");

      // Listen to contract events
      contract.on("CampaignCreated", handleCampaignCreated);
      contract.on("CampaignDonated", handleCampaignDonated);
      contract.on("CampaignPublished", handleCampaignPublished);
      contract.on("FundsWithdrawn", handleFundsWithdrawn);

      return () => {
        console.log("Cleaning up contract event listeners...");
        contract.removeAllListeners("CampaignCreated");
        contract.removeAllListeners("CampaignDonated");
        contract.removeAllListeners("CampaignPublished");
        contract.removeAllListeners("FundsWithdrawn");
      };
    }
  }, [contract, isConnected, handleCampaignCreated, handleCampaignDonated, handleCampaignPublished, handleFundsWithdrawn]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Contract Address:", CONTRACT_ADDRESS);
      console.log("CrowdFunding ABI:", CrowdFunding.abi);
      const checkConnection = async () => {
        if (window.ethereum) {
          const accounts = (await window.ethereum.request({
            method: "eth_accounts",
          })) as string[];
          if (accounts?.length) {
            await connect();
          }
        }
      };

      const handleAccountsChanged = (accounts: unknown) => {
        if (Array.isArray(accounts)) {
          if (accounts.length === 0) {
            disconnect();
          } else if (accounts[0] !== address) {
            connect();
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      checkConnection();

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        signer,
        contract,
        connect,
        disconnect,
        chainId,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
