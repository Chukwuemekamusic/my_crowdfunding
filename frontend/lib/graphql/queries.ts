import { gql } from 'graphql-request';

// Query to get user-specific activities
export const GET_USER_ACTIVITIES = gql`
  query GetUserActivities($userAddress: Bytes!, $first: Int = 10) {
    activities(
      where: { user: $userAddress }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
    ) {
      id
      type
      campaignId
      campaignTitle
      user
      amount
      blockTimestamp
      transactionHash
    }
  }
`;

// Query to get all activities (general platform activity)
export const GET_ALL_ACTIVITIES = gql`
  query GetAllActivities($first: Int = 10) {
    activities(
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
    ) {
      id
      type
      campaignId
      campaignTitle
      user
      amount
      blockTimestamp
      transactionHash
    }
  }
`;

// Query to get activities by type
export const GET_ACTIVITIES_BY_TYPE = gql`
  query GetActivitiesByType($userAddress: Bytes!, $type: ActivityType!, $first: Int = 10) {
    activities(
      where: { user: $userAddress, type: $type }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
    ) {
      id
      type
      campaignId
      campaignTitle
      user
      amount
      blockTimestamp
      transactionHash
    }
  }
`;

// Query to get activities for a specific campaign
export const GET_CAMPAIGN_ACTIVITIES = gql`
  query GetCampaignActivities($campaignId: BigInt!, $first: Int = 20) {
    activities(
      where: { campaignId: $campaignId }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
    ) {
      id
      type
      campaignTitle
      user
      amount
      blockTimestamp
      transactionHash
    }
  }
`;
