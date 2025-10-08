// Activity types matching the subgraph schema
export type ActivityType =
  | 'DONATION'
  | 'WITHDRAWAL'
  | 'PUBLISHED'
  | 'CANCELLED'
  | 'CREATED'
  | 'UPDATED';

// Activity entity from subgraph
export interface Activity {
  id: string;
  type: ActivityType;
  campaignId: string;
  campaignTitle: string;
  user: string;
  amount: string | null;
  blockTimestamp: string;
  transactionHash: string;
}

// Response type for user activities query
export interface GetUserActivitiesResponse {
  activities: Activity[];
}

// Response type for all activities query
export interface GetAllActivitiesResponse {
  activities: Activity[];
}

// Response type for activities by type query
export interface GetActivitiesByTypeResponse {
  activities: Activity[];
}

// Response type for campaign activities query
export interface GetCampaignActivitiesResponse {
  activities: Activity[];
}

// Variables for user activities query
export interface GetUserActivitiesVariables {
  userAddress: string;
  first?: number;
}

// Variables for all activities query
export interface GetAllActivitiesVariables {
  first?: number;
}

// Variables for activities by type query
export interface GetActivitiesByTypeVariables {
  userAddress: string;
  type: ActivityType;
  first?: number;
}

// Variables for campaign activities query
export interface GetCampaignActivitiesVariables {
  campaignId: string;
  first?: number;
}
