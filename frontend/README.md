# CrowdFunding Frontend

A decentralized crowdfunding platform built with Next.js, featuring real-time blockchain data indexing via The Graph Protocol.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) with App Router
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Web3 Library**: [ethers.js](https://docs.ethers.org/v6/)
- **Indexing**: [The Graph Protocol](https://thegraph.com/)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API

## Features

- **Wallet Integration**: Connect with MetaMask and manage campaigns
- **Real-time Activity Feed**: Track donations, withdrawals, and campaign events via The Graph subgraph
- **Campaign Management**: Create, publish, and manage crowdfunding campaigns
- **Dashboard Analytics**: View campaign stats and user activities

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Access to Ethereum Sepolia testnet

## Environment Setup

Create a `.env` file in the frontend directory:

```bash
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_RPC_URL=your_rpc_url
NEXT_PUBLIC_CHAIN_ID=11155111

# The Graph Subgraph
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/122239/my-crowdfunding/version/latest

# Pinata IPFS (for image uploads)
NEXT_PINATA_API_KEY=your_pinata_key
NEXT_PINATA_API_SECRET=your_pinata_secret
NEXT_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_gateway_url

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open the app**:
Navigate to [http://localhost:3000](http://localhost:3000)

4. **Connect your wallet**:
- Make sure MetaMask is installed
- Switch to Sepolia testnet
- Connect your wallet to start using the platform

## The Graph Integration

This project uses [The Graph](https://thegraph.com/) to index and query blockchain events efficiently. The subgraph tracks:

- **Campaign Events**: Creation, publishing, updates, cancellation
- **Financial Events**: Donations and withdrawals
- **User Activities**: All interactions filtered by wallet address

### Subgraph Features

- **Real-time Indexing**: Events are indexed as they occur on-chain
- **Efficient Queries**: GraphQL API for fast data retrieval
- **Activity Feed**: User-specific activity tracking on the dashboard

### GraphQL Queries

The app includes pre-built queries in `lib/graphql/queries.ts`:
- `GET_USER_ACTIVITIES` - Fetch user-specific activities
- `GET_ALL_ACTIVITIES` - Fetch platform-wide activities
- `GET_ACTIVITIES_BY_TYPE` - Filter by activity type
- `GET_CAMPAIGN_ACTIVITIES` - Get activities for a specific campaign

### Subgraph Schema

Activities tracked include:
- `DONATION` - Campaign donations
- `WITHDRAWAL` - Fund withdrawals
- `PUBLISHED` - Campaign publications
- `CREATED` - New campaign creation
- `CANCELLED` - Campaign cancellation
- `UPDATED` - Campaign updates

## Project Structure

```
frontend/
├── app/                    # Next.js app router pages
├── components/            # React components
│   └── ActivityFeed.tsx   # The Graph powered activity feed
├── context/              # Web3 context provider
├── hooks/                # Custom React hooks
├── lib/
│   └── graphql/         # The Graph integration
│       ├── client.ts    # GraphQL client setup
│       ├── queries.ts   # GraphQL queries
│       └── types.ts     # TypeScript types
├── constants/           # Contract ABI and constants
└── utils/              # Utility functions
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [The Graph Documentation](https://thegraph.com/docs/en/)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deploy on Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy

The app will be automatically deployed on every push to your main branch.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
