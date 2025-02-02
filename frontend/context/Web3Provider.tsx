"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Web3Context } from "./web3Context";
// import CrowdFunding from "../../my_web3/artifacts/contracts/CrowdFunding.sol/CrowdFunding.json";
import CrowdFunding from "@/constants/contracts/CrowdFunding.sol/CrowdFunding.json";
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
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS!,
        CrowdFunding.abi,
        signer
      );
      setAddress(address);
      setSigner(signer);
      setContract(contract);
      setChainId(Number(network.chainId));
      toast.success("connected");
      setIsConnected(true);
    } catch (err) {
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
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts?.length) {
          await connect();
        }
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        connect();
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
