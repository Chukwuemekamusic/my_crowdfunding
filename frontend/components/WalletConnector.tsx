"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function WalletConnector() {
  const [account, setAccount] = useState<string>("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      {account ? (
        <span>
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
