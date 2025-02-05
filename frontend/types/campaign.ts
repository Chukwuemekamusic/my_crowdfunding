// types/campaign.ts
export interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  withdrawnAmount: bigint;
  image: string;
  category: number;
  status: number;
  donorCount: number;
  allowFlexibleWithdrawal: boolean;
}
// types/campaign.ts
