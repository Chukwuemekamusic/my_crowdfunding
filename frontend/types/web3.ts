// types/web3.ts

import { ethers } from "ethers";

export interface Web3ContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
  error: string | null;
}
