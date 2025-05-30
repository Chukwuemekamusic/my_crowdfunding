# Crowdfunding dApp Development Guide (Foundry Version)

## Prerequisites

- Node.js (v18.x or later)
- Git
- MetaMask browser extension
- Pinata API Key (for IPFS storage)
- Visual Studio Code (recommended)
- Foundry (for smart contract development)

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
└── forge_contract/     # Smart contract and Foundry setup
    ├── src/           # Smart contract source files
    ├── script/        # Deployment scripts
    ├── test/         # Contract test files
    └── lib/          # Dependencies
```

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install Foundry (if not already installed):

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. Install dependencies:

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install smart contract dependencies
   cd ../forge_contract
   forge install
   ```

4. Create environment variables:

   ```bash
   # .env.local
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   NEXT_PINATA_JWT=your_pinata_jwt
   NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway
   ```

5. Start local Anvil node (Foundry's local blockchain):

   ```bash
   # In forge_contract directory
   cd forge_contract
   anvil
   ```

6. Deploy smart contracts (in a new terminal):

   ```bash
   # In forge_contract directory
   cd forge_contract
   forge script script/DeployCrowdFunding.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

7. Start the frontend development server:
   ```bash
   # In frontend directory
   cd frontend
   npm run dev
   ```

## Smart Contract Development with Foundry

### Testing

```bash
# Run all tests
forge test

# Run specific test
forge test --match-test test_createDraft

# Run tests with coverage
forge coverage --ir-minimum
```

### Compilation

```bash
# Compile contracts
forge build

# Clean build artifacts
forge clean
```

### Deployment

```bash
# Deploy to local network
forge script script/DeployCrowdFunding.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to testnet
forge script script/DeployCrowdFunding.s.sol --rpc-url $RPC_URL --broadcast --verify
```

## MetaMask Configuration

1. Add Anvil Network:

   - Network Name: `Anvil`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. Import a test account:
   - Get private key from Anvil output
   - In MetaMask: Account -> Import Account -> Paste private key

## Common Issues and Solutions

### Foundry/Forge Issues

1. Stack Too Deep Errors:

   - Use `--ir-minimum` flag when running tests
   - Optimize contract code to reduce local variables
   - Consider splitting complex functions

2. Contract Deployment Issues:
   - Ensure Anvil is running
   - Check if the correct network is selected
   - Verify contract compilation is successful

### MetaMask Connection Issues

1. RPC URL Configuration:

   - Use `localhost:8545` instead of `127.0.0.1:8545`
   - Ensure Anvil node is running
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
   forge build
   forge script script/DeployCrowdFunding.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

2. Update Frontend Contract Address:

   - Copy the new contract address from deployment
   - Update in `.env.local`

3. Testing:

   ```bash
   # Run contract tests
   forge test

   # Run frontend tests
   npm run test
   ```

## Best Practices

1. Smart Contract Development:

   - Always run tests before deployment
   - Use custom errors instead of require statements
   - Implement proper access control
   - Follow gas optimization patterns
   - Use Foundry's fuzzing capabilities for testing

2. Frontend Development:

   - Use TypeScript for type safety
   - Implement proper error handling for Web3 interactions
   - Follow React best practices (hooks, context)
   - Use Tailwind utility classes consistently

3. Version Control:
   - Create feature branches for new development
   - Write meaningful commit messages
   - Keep PR sizes manageable

## License

MIT License - See LICENSE file for details

---

Remember to always backup your data and use test networks for development.
