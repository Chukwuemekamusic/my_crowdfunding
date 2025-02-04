# Crowdfunding dApp Development Guide

## Prerequisites

- Node.js (v18.x or later)
- Git
- MetaMask browser extension
- Pinata API Key (for IPFS storage)
- Visual Studio Code (recommended)

## Project Structure

```
project-root/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app router
│   ├── components/          # Reusable React components
│   ├── context/            # React context for Web3
│   ├── hooks/             # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # Contract ABIs and addresses
│   ├── providers/       # Context providers
│   └── utils/          # Utility functions
└── my_web/            # Smart contract and Hardhat setup
    ├── contracts/     # Smart contract source files
    ├── scripts/      # Deployment and test scripts
    ├── test/        # Contract test files
    └── config/     # Hardhat and deployment configs
```

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies for both frontend and smart contract:

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install smart contract dependencies
   cd ../my_web
   npm install
   ```

3. Create environment variables:

   ```bash
   # .env.local
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   NEXT_PINATA_JWT=your_pinata_jwt
   NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway
   ```

4. Start local Hardhat node:

   ```bash
   # In my_web directory
   cd my_web
   npx hardhat node
   ```

5. Deploy smart contracts (in a new terminal):

   ```bash
   # In my_web directory
   cd my_web
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. Start the frontend development server:
   ```bash
   # In frontend directory
   cd frontend
   npm run dev
   ```

## MetaMask Configuration

1. Add Hardhat Network:

   - Network Name: `Hardhat`
   - RPC URL: `http://localhost:8545` (Important: Use `localhost`, not `127.0.0.1`)
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. Import a test account:
   - Get private key from Hardhat node output
   - In MetaMask: Account -> Import Account -> Paste private key

## Common Issues and Solutions

### MetaMask Connection Issues

1. RPC URL Configuration:

   - Use `localhost:8545` instead of `127.0.0.1:8545`
   - Ensure Hardhat node is running
   - Check if the correct network is selected in MetaMask

2. Contract Interaction Failures:
   - Verify contract deployment was successful
   - Check if CONTRACT_ADDRESS matches deployed address
   - Ensure ABI is up to date after contract modifications

### IPFS/Pinata Issues

1. Image Upload Failures:

   - Verify Pinata JWT token is valid
   - Check file size limits (2MB per campaign)
   - Ensure gateway URL is correct

2. Image Loading Issues:
   - Check if gateway URL is whitelisted in Next.js config
   - Verify image URL format matches gateway structure

## Development Workflow

1. Smart Contract Modifications:

   ```bash
   # After modifying contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```

2. Update Frontend Contract Address:

   - Copy the new contract address from deployment
   - Update in `.env.local`

3. Testing:

   ```bash
   # Run contract tests
   npx hardhat test

   # Run frontend tests
   npm run test
   ```

## Best Practices

1. Smart Contract Development:

   - Always run tests before deployment
   - Use custom errors instead of require statements
   - Implement proper access control
   - Follow gas optimization patterns

2. Frontend Development:

   - Use TypeScript for type safety
   - Implement proper error handling for Web3 interactions
   - Follow React best practices (hooks, context)
   - Use Tailwind utility classes consistently

3. Version Control:
   - Create feature branches for new development
   - Write meaningful commit messages
   - Keep PR sizes manageable

## Deployment

### Local Testing

1. Start Hardhat node
2. Deploy contracts
3. Configure MetaMask
4. Run frontend application

### Testnet Deployment

1. Update hardhat.config.js with network details
2. Deploy to testnet
3. Update environment variables
4. Deploy frontend to chosen platform

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Create Pull Request

## Support

For additional help:

- Check existing issues
- Create new issue with detailed description
- Join our Discord community

## License

MIT License - See LICENSE file for details

---

Remember to always backup your data and use test networks for development.
