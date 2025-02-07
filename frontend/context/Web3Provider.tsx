"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Web3Context } from "./web3Context";
import CrowdFunding from "@/constants/CrowdFunding.json";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS!,
        CrowdFunding.abi,
        signer
      );
      console.log("Contract instance created:", contract);

      setAddress(address);
      setSigner(signer);
      setContract(contract);
      setChainId(Number(network.chainId));
      toast.success("connected");
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
