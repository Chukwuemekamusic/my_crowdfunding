# Crowdfunding dApp Master Plan

## Overview

A decentralized crowdfunding platform built on Ethereum where users can create and contribute to campaigns. The platform emphasizes transparency, ease of use, and community engagement through features like campaign updates and donor comments.

## Tech Stack

- Frontend: Next.js, TailwindCSS, shadcn/ui
- Blockchain: Ethereum, Ethers.js
- Storage: IPFS (for campaign images and updates)
- Additional: Email notification system

## Core Features

### 1. Wallet Connection

- Support for multiple wallets (MetaMask, Rainbow)
- Persistent connection state
- Account balance display
- Network detection and switching

### 2. Campaign Creation and Management

#### Form Fields:

- Title
- Description
- Category (dropdown)
- Target amount (ETH)
- Deadline
- Campaign image
- Preview mode before publishing

#### Creation Flow:

1. **Draft Creation:**

- Basic information entry
- Category selection
- Image upload to IPFS or space for users to put their IPFS image url
- Form validation
- Save as draft option
- Users can upload up to 2MB per campaign, with a maximum of 6MB per user.

2. **Draft Management:**

- Edit capabilities
- Preview mode
- Publish action
- Cancel action

3. **Published Campaign:**

Post updates
Withdraw funds
View donations
Monitor progress

### 2. Campaign Creation

#### Form Fields:

- Title
- Description
- Category (dropdown)
- Target amount (ETH)
- Deadline
- Campaign image
- Preview mode before publishing

### 3. Campaign Display

#### Home Page:

- Featured/trending campaigns
- Category-based filters:
  - Technology
  - Art
  - Community
  - Business
  - Charity
  - Other
- Status filters (Active, Completed)
- Search functionality
- Responsive grid layout

#### Campaign Details Page:

- Campaign status badge
- Campaign progress
- Donation history
- Updates section
- Donor-only comments
- Follow button
- Share functionality
- Countdown timer
- Donation form

### 4. User Dashboard

#### Campaign Management:

- Draft campaigns list

  - Edit interface
  - Preview mode
  - Publish action

- Published campaigns list
  - Campaign statistics
  - Withdrawal interface
  - Update posting interface

#### Following:

- Followed campaigns list
- Quick access to campaign details
- Notification preferences

### 5. Comments and Updates System

#### Updates:

- Stored on IPFS
- Linked to campaign ID
- Timestamp and author verification
- Email notifications to followers

#### Comments:

- Donor verification
- On-chain address verification
- Timestamp
- Basic moderation capabilities

### 6. Notification System

#### Campaign Creators:

- New donation alerts
- Campaign deadline approaching
- Goal reached notification

#### Donors:

- Campaign completion notification
- Goal reached notification
- New updates from creator

## Database Schema (for off-chain data)

### Campaign Updates

```typescript
interface CampaignUpdate {
  id: string;
  campaignId: string;
  creatorAddress: string;
  content: string;
  ipfsHash: string;
  timestamp: number;
}
```

### Comments

```typescript
interface Comment {
  id: string;
  campaignId: string;
  donorAddress: string;
  content: string;
  timestamp: number;
  donationAmount: string; // ??Track donor's contribution
}
```

### User Preferences

```typescript
interface UserPreferences {
  address: string;
  followedCampaigns: string[];
  emailNotifications: boolean;
  email?: string;
}
```

## Implementation Phases

### Phase 1: Core Functionality

1. Smart contract deployment
2. Basic UI implementation
3. Wallet connection
4. Campaign creation
5. Campaign listing
6. Donation functionality

### Phase 2: Enhanced Features

1. Category and status filters
2. Campaign following system
3. Comments system
4. Updates system
5. User dashboard
6. IPFS integration

### Phase 3: Advanced Features

1. Email notification system
2. Preview/draft mode
3. Enhanced mobile responsiveness
4. Performance optimizations
5. Analytics integration

## Security Considerations

1. Smart contract security

   - Access control
   - Input validation
   - Reentrancy protection

2. Frontend security

   - Data validation
   - XSS prevention
   - Wallet connection security

3. User data protection
   - Minimal data collection
   - Secure email handling
   - Privacy considerations

## Testing Strategy

1. Smart Contract Testing

   - Unit tests
   - Integration tests
   - Network fork tests

2. Frontend Testing

   - Component testing
   - Integration testing
   - E2E testing
   - Mobile responsiveness testing

3. User Testing
   - Usability testing
   - Performance testing
   - Cross-browser testing

## Performance Optimization

1. Image optimization
2. Lazy loading
3. Caching strategies
4. Bundle size optimization
5. IPFS gateway optimization

## Future Enhancements

1. Social features expansion
2. Multiple token support
3. DAO governance
4. Campaign templates
5. Advanced analytics

## Maintenance Plan

1. Regular smart contract audits
2. Performance monitoring
3. User feedback collection
4. Regular updates and improvements
5. Documentation updates
