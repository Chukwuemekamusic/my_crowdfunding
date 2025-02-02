// context/web3Context.ts
"use client";
import { createContext } from "react";
import { Web3ContextType } from "@/types/web3";

// import { ethers } from 'ethers';

// export interface Web3ContextType {
//   address: string | null;
//   isConnecting: boolean;
//   isConnected: boolean;
//   signer: ethers.Signer | null;
//   contract: ethers.Contract | null;
//   connect: () => Promise<void>;
//   disconnect: () => void;
//   chainId: number | null;
//   error: string | null;
// }

export const Web3Context = createContext<Web3ContextType | null>(null);
