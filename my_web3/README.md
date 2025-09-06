# CrowdFunding Smart Contract - Hardhat Version

A decentralized crowdfunding platform built with Solidity and deployed using Hardhat. This implementation demonstrates the same smart contract functionality as the Foundry version but uses Hardhat for development, testing, and deployment workflows.

## 📋 Features

- **Draft & Published Campaign Workflow**: Create campaigns as drafts for editing before publishing
- **Flexible Withdrawal Options**: Configure campaigns for immediate or deadline-based fund withdrawal
- **Category System**: Organize campaigns by Technology, Art, Community, Business, Charity, or Other
- **Comprehensive Donor Tracking**: Track donation amounts, timestamps, and donation counts per user
- **Pagination Support**: Efficient querying for large datasets
- **Campaign Filtering**: Filter by status (active/completed), category, and ownership
- **Gas Optimized**: Uses library architecture for code reuse and gas efficiency

## 🏗️ Architecture

### Smart Contracts

- **`CrowdFunding.sol`**: Main contract handling campaign creation, donations, and withdrawals
- **`CampaignLib.sol`**: Library containing data structures, validation functions, and utilities

### Key Components

- **Campaign Lifecycle**: Draft → Published → Completed/Cancelled
- **Donor Management**: Track individual contributions and donation history
- **Flexible Withdrawals**: Allow campaign owners to withdraw funds before deadline (optional)
- **Event Logging**: Comprehensive event emission for frontend integration

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my_crowdfunding/my_web3

# Install dependencies
npm install

# Create environment file
cp ../.env.example ../.env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
PRIVATE_KEY=your-private-key-here

# Etherscan Verification
ETHERSCAN_API_KEY=your-etherscan-api-key

# Gas Reporting
REPORT_GAS=false
```

## 🛠️ Development Commands

### Compilation
```bash
npm run build                  # Compile contracts
npm run clean                  # Clean artifacts and cache
```

### Testing
```bash
npm test                       # Run all tests
npm run test:gas              # Run tests with gas reporting
npm run test:coverage         # Generate coverage report
```

### Local Development
```bash
npm run node                   # Start local Hardhat node
npm run deploy:local          # Deploy to local network
npm run deploy:basic:local    # Deploy without sample campaigns
```

### Testnet Deployment
```bash
npm run deploy:sepolia        # Deploy to Sepolia testnet
npm run deploy:basic:sepolia  # Deploy to Sepolia without samples
npm run verify:sepolia        # Verify contract on Sepolia
```

## 📦 Contract Deployment

### Basic Deployment
```bash
# Deploy contract only
npm run deploy:basic:local    # Local network
npm run deploy:basic:sepolia  # Sepolia testnet
```

### Full Deployment with Sample Campaigns
```bash
# Deploy contract and create sample campaigns from campaigns.json
npm run deploy:local          # Local network  
npm run deploy:sepolia        # Sepolia testnet
```

### Contract Verification
```bash
npm run verify:sepolia        # Verify on Sepolia
npm run verify:contract       # Verify using saved config
```

## 🧪 Testing

The project includes comprehensive JavaScript tests using Hardhat, Chai, and Ethers.js:

### Test Categories
- **Deployment Tests**: Contract initialization and ownership
- **Campaign Creation**: Draft and published campaign creation
- **Campaign Management**: Update, publish, cancel operations
- **Donation System**: ETH donations and donor tracking
- **Fund Withdrawal**: Owner withdrawals with various conditions
- **Query Functions**: Pagination and filtering
- **Error Handling**: Invalid operations and edge cases
- **Integration Tests**: Complete campaign lifecycle

### Running Tests
```bash
# All tests
npm test

# With gas reporting
npm run test:gas

# With coverage
npm run test:coverage

# Specific test file
npx hardhat test test/CrowdFundingComprehensive.test.js
```

## 📂 Project Structure

```
my_web3/
├── contracts/
│   ├── CrowdFunding.sol        # Main crowdfunding contract
│   └── CampaignLib.sol         # Shared library and utilities
├── test/
│   └── CrowdFundingComprehensive.test.js  # JavaScript test suite
├── scripts/
│   ├── deploy.js               # Main deployment script
│   ├── deploy-basic.js         # Basic deployment (no samples)
│   └── verify.js               # Contract verification script
├── config/
│   ├── contract-address.json   # Deployed contract addresses
│   └── deployment-info.json    # Full deployment metadata
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🔧 Configuration

### Hardhat Config Features
- **Solidity 0.8.27** with optimization enabled
- **Multiple Networks**: Local, Hardhat, Sepolia
- **Gas Reporter**: Track gas usage in tests
- **Etherscan Verification**: Automatic contract verification
- **TypeChain**: Generate TypeScript bindings

### Network Configuration
```javascript
// hardhat.config.js
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111
  }
}
```

## 📊 Gas Usage

Monitor gas consumption with:
```bash
REPORT_GAS=true npm test
```

Example gas costs (approximate):
- Campaign Creation: ~350,000 gas
- Donation: ~85,000 gas  
- Withdrawal: ~55,000 gas
- Campaign Update: ~45,000 gas

## 🔍 Contract Interaction

### Basic Contract Interface
```javascript
// Deploy contract
const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
const contract = await CrowdFunding.deploy();

// Create campaign
const campaignInput = {
  title: "My Campaign",
  description: "Campaign description",
  target: ethers.parseEther("1.0"),
  deadline: futureTimestamp,
  image: "https://example.com/image.png",
  category: 0, // Technology
  allowFlexibleWithdrawal: false
};

await contract.createPublishedCampaign(campaignInput);

// Donate to campaign
await contract.donateToCampaign(0, { value: ethers.parseEther("0.1") });

// Get campaign info
const campaign = await contract.getCampaign(0, true);
```

## 🌐 Frontend Integration

After deployment, use the generated config files:

```javascript
// Frontend integration example
import contractConfig from './config/contract-address.json';

const contractAddress = contractConfig.contractAddress;
const contract = new ethers.Contract(contractAddress, ABI, provider);
```

## 🐛 Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check network configuration
   - Verify sufficient ETH balance
   - Ensure private key is correct

2. **Verification Fails**
   - Confirm ETHERSCAN_API_KEY is set
   - Wait for block confirmations
   - Check network matches deployment

3. **Tests Fail**
   - Run `npm run clean` then `npm run build`
   - Check Node.js version compatibility
   - Verify all dependencies installed

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add comprehensive tests
4. Ensure all tests pass
5. Submit a pull request

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)
