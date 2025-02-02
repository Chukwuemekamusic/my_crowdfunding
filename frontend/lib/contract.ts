// import { ethers } from "ethers";
// import { Category, CampaignStatus, Campaign } from "@/types";
// import CrowdFunding from "../../my_web3/artifacts/contracts/CrowdFunding.sol/CrowdFunding.json";

// export const CONTRACT_ADDRESS = process.env
//   .NEXT_PUBLIC_CONTRACT_ADDRESS as string;

// export interface CampaignContract extends ethers.Contract {
//   getPublishedCampaigns: () => Promise<Campaign[]>;
//   getUserDraftCampaigns: (address: string) => Promise<Campaign[]>;
//   createCampaign: (
//     title: string,
//     description: string,
//     target: bigint,
//     deadline: number,
//     image: string,
//     category: Category,
//     publishImmediately: boolean
//   ) => Promise<ethers.ContractTransactionResponse>;
// }

// export const getContract = (): CampaignContract => {
//   const provider = new ethers.BrowserProvider(window.ethereum);
//   const signer = provider.getSigner();
//   return new ethers.Contract(
//     CONTRACT_ADDRESS,
//     CrowdFunding.abi,
//     signer
//   ) as CampaignContract;
// };
