export enum Category {
  Technology = 0,
  Art = 1,
  Community = 2,
  Business = 3,
  Charity = 4,
  Other = 5,
}

export enum CampaignStatus {
  Draft = 0,
  Published = 1,
  Cancelled = 2,
}

export interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  currentBalance: bigint;
  image: string;
  category: Category;
  status: CampaignStatus;
  donators: string[];
  donations: bigint[];
}
