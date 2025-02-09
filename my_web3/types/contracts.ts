// types/contracts.ts
import { BaseContract, BigNumberish, ContractTransaction } from "ethers";

export interface CampaignInput {
  title: string;
  description: string;
  target: BigNumberish;
  deadline: BigNumberish;
  image: string;
  category: number;
  publishImmediately: boolean;
  allowFlexibleWithdrawal: boolean;
}

export interface CampaignUpdateInput {
  id: BigNumberish;
  title: string;
  description: string;
  target: BigNumberish;
  deadline: BigNumberish;
  image: string;
  category: number;
}

export interface PaginationParams {
  offset: BigNumberish;
  limit: BigNumberish;
}

export interface Campaign {
  id: BigNumberish;
  owner: string;
  title: string;
  description: string;
  target: BigNumberish;
  deadline: BigNumberish;
  amountCollected: BigNumberish;
  withdrawnAmount: BigNumberish;
  image: string;
  category: number;
  status: number;
  donorCount: BigNumberish;
  allowFlexibleWithdrawal: boolean;
}

export interface CrowdFundingContract extends BaseContract {
  createCampaign(input: CampaignInput): Promise<ContractTransaction>;
  updateDraftCampaign(input: CampaignUpdateInput): Promise<ContractTransaction>;
  publishCampaign(id: BigNumberish): Promise<ContractTransaction>;
  cancelDraftCampaign(id: BigNumberish): Promise<ContractTransaction>;
  donateToCampaign(
    id: BigNumberish,
    overrides?: { value: BigNumberish }
  ): Promise<ContractTransaction>;
  withdrawCampaignFunds(id: BigNumberish): Promise<ContractTransaction>;
  getCampaign(id: BigNumberish, publishedOnly: boolean): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getPublishedCampaigns(
    params: PaginationParams
  ): Promise<[Campaign[], BigNumberish]>;
  getPublishedCampaigns2(): Promise<Campaign[]>;
  getUserDraftCampaigns(owner: string): Promise<Campaign[]>;
  getRemainingBalance(id: BigNumberish): Promise<BigNumberish>;
  getDonorCount(id: BigNumberish): Promise<BigNumberish>;
  getCampaignsByCategory(category: number): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
}
