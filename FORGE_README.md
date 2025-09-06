# Crowdfunding dApp Development Guide

> **Educational Implementation** - This project demonstrates the same smart contracts implemented with both **Foundry** and **Hardhat** toolchains to showcase different Web3 development approaches.

## 🎯 Dual Implementation Purpose

This project intentionally maintains **two identical smart contract implementations**:
- **`forge_contract/`** - Foundry/Forge toolchain (Rust-based)
- **`my_web3/`** - Hardhat toolchain (JavaScript/TypeScript-based)

Both implementations contain the **exact same contracts** (`CrowdFunding.sol`, `CampaignLib.sol`) but demonstrate different:
- Development workflows
- Testing methodologies  
- Deployment strategies
- Tooling ecosystems

## Prerequisites

### Required Tools
- **Node.js** (v18.x or later)
- **Git** 
- **MetaMask** browser extension
- **Visual Studio Code** (recommended)

### Blockchain Development Tools
- **Foundry** - For Rust-based development workflow
- **Hardhat** - For JavaScript/TypeScript workflow (installed via npm)

### External Services
- **Pinata API Key** (for IPFS storage)
- **Alchemy/Infura RPC** (for testnet deployment)
- **Etherscan API Key** (for contract verification)

## 📁 Complete Project Structure

```
project-root/
├── frontend/                    # Next.js frontend application
│   ├── app/                    # Next.js app router pages
│   ├── components/             # Reusable React components
│   ├── context/               # Web3 context providers
│   ├── hooks/                # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── constants/          # Contract ABIs and addresses
│   ├── utils/             # Utility functions
│   └── .env.production   # Production environment config
├── forge_contract/        # 🔥 FOUNDRY IMPLEMENTATION
│   ├── src/              # Smart contract source files
│   │   ├── CrowdFunding.sol     # Main contract
│   │   └── CampaignLib.sol      # Utility library
│   ├── script/           # Foundry deployment scripts
│   ├── test/            # Solidity test files
│   ├── lib/            # Foundry dependencies
│   ├── Makefile       # Build automation
│   └── foundry.toml  # Foundry configuration
└── my_web3/           # ⚡ HARDHAT IMPLEMENTATION  
    ├── contracts/     # Smart contract source files (identical)
    │   ├── CrowdFunding.sol     # Same contract as Foundry
    │   └── CampaignLib.sol      # Same library as Foundry
    ├── test/         # JavaScript test files
    ├── scripts/      # JavaScript deployment scripts
    ├── config/       # Deployment configurations
    ├── Makefile     # Build automation (Hardhat version)
    ├── TESTING.md  # Comprehensive testing guide
    └── hardhat.config.js  # Hardhat configuration
```

## 🚀 Local Development Setup

### 1. Clone the repository:
```bash
git clone <repository-url>
cd crowdfunding-project
```

### 2. Install Blockchain Development Tools

#### Foundry Installation:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### Hardhat (installed via npm in each implementation)

### 3. Install Dependencies

#### Frontend:
```bash
cd frontend
npm install
```

#### Foundry Implementation:
```bash
cd ../forge_contract
forge install  # Installs Solidity dependencies
```

#### Hardhat Implementation:
```bash
cd ../my_web3
npm install    # Installs JavaScript/TypeScript dependencies  
```

### 4. Environment Configuration

Create `.env` file in project root:
```bash
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here

# Contract Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# IPFS Configuration (Frontend)
NEXT_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway
NEXT_PINATA_API_KEY=your_pinata_api_key
NEXT_PINATA_API_SECRET=your_pinata_secret

# Contract Address (Updated after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
```

## 🛠️ Development Workflows

### Choose Your Toolchain:

#### Option A: Foundry Workflow (Rust-based)
```bash
cd forge_contract

# Start local blockchain
anvil

# In another terminal - Deploy contracts  
make deploy-local
# or manually:
# forge script script/DeployCrowdFunding.s.sol --rpc-url http://localhost:8545 --broadcast
```

#### Option B: Hardhat Workflow (JavaScript-based)
```bash
cd my_web3

# Start local blockchain
make node
# or: npm run node

# In another terminal - Deploy contracts
make deploy-local  
# or: npm run deploy:local
```

### Start Frontend (same for both):
```bash
cd frontend
npm run dev
```

Your dApp will be available at `http://localhost:3000`

## 🔥 Smart Contract Development - Foundry Toolchain

### Testing (Solidity-based)

```bash
cd forge_contract

# Run all tests (recommended)
make test
# or: forge test

# Run specific test function
forge test --match-test test_createDraft

# Run tests with coverage
make coverage
# or: forge coverage --ir-minimum

# Run tests with gas reporting
make test-gas

# Watch mode for continuous testing
make test-watch
```

### Compilation & Building

```bash
# Compile contracts
make build
# or: forge build

# Clean build artifacts
make clean
# or: forge clean

# Format code
make fmt
# or: forge fmt
```

### Deployment (Foundry)

```bash
# Deploy to local network (Anvil)
make deploy-local

# Deploy to Sepolia testnet
make deploy-sepolia

# Deploy with verification
make deploy-sepolia-verify
```

## ⚡ Smart Contract Development - Hardhat Toolchain

### Testing (JavaScript-based)

```bash
cd my_web3

# Run all tests (comprehensive suite)
make test
# or: npm test

# Run tests with gas reporting
make test-gas
# or: npm run test:gas

# Run test coverage
make test-coverage  
# or: npm run test:coverage

# Watch mode (requires nodemon)
make test-watch
```

### Compilation & Building

```bash
# Compile contracts
make build
# or: npm run build

# Clean build artifacts  
make clean
# or: npm run clean

# Check environment
make check-env
```

### Deployment (Hardhat)

```bash
# Deploy to local network
make deploy-local
# or: npm run deploy:local

# Deploy to Sepolia testnet
make deploy-sepolia
# or: npm run deploy:sepolia

# Basic deployment (no sample campaigns)
make deploy-basic-sepolia

# Verify deployed contract
make verify-sepolia
```

## 📊 Toolchain Comparison

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| **Language** | Rust-based | JavaScript/TypeScript |
| **Tests** | Solidity | JavaScript/Chai |
| **Performance** | Very Fast | Moderate |
| **Learning Curve** | Steeper | Gentler |
| **Community** | Growing | Established |
| **Gas Reporting** | Built-in | Plugin-based |
| **Debugging** | CLI-focused | Rich ecosystem |

### When to Use Which:

**Use Foundry when:**
- You prefer Rust-based tooling
- Speed is critical for testing
- You want native Solidity testing
- You're building complex DeFi protocols

**Use Hardhat when:**
- You prefer JavaScript/TypeScript
- You need rich debugging tools
- You're integrating with JS/TS frontend
- You want extensive plugin ecosystem

## 🦊 MetaMask Configuration

### Local Development Network Setup

1. **Add Local Network:**
   - Network Name: `Local Blockchain` (Foundry: Anvil / Hardhat: Hardhat Network)
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   
   **For Foundry (Anvil):**
   ```bash
   # Anvil provides test accounts with private keys
   # Copy any private key from Anvil startup output
   ```
   
   **For Hardhat:**
   ```bash
   # Use first hardhat test account
   cd my_web3
   make accounts  # Shows available test accounts
   ```
   
   Then: MetaMask → Account → Import Account → Paste private key

### Production Network (Sepolia)

- Network Name: `Sepolia`  
- RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Chain ID: `11155111`
- Currency Symbol: `SepoliaETH`
- Block Explorer: `https://sepolia.etherscan.io`

## 🔧 Common Issues and Solutions

### Foundry/Forge Specific Issues

1. **Stack Too Deep Errors:**
   ```bash
   # Use IR compilation flag
   forge test --ir-minimum
   forge coverage --ir-minimum
   
   # Or enable in foundry.toml
   via_ir = true
   ```

2. **Contract Deployment Issues:**
   ```bash
   # Ensure Anvil is running
   anvil --host 0.0.0.0
   
   # Check compilation
   forge build
   
   # Verify deployment script
   forge script script/DeployCrowdFunding.s.sol --rpc-url http://localhost:8545 --broadcast -vvvv
   ```

3. **Library Linking Issues:**
   ```bash
   # Clean and rebuild with dependencies
   forge clean
   forge install
   forge build
   ```

### Hardhat Specific Issues

1. **Compilation Errors:**
   ```bash
   # Clear cache and rebuild
   make clean
   make build
   
   # Or manually:
   npx hardhat clean
   npx hardhat compile
   ```

2. **Test Failures:**
   ```bash
   # Run specific test file
   npx hardhat test test/CrowdFundingComprehensive.test.js
   
   # With verbose output
   npx hardhat test --verbose
   ```

3. **Network Connection Issues:**
   ```bash
   # Check if Hardhat network is running
   npm run node
   
   # In another terminal, test connection
   make accounts
   ```

### Universal Issues (Both Toolchains)

1. **MetaMask Connection:**
   - Use `localhost:8545` (not `127.0.0.1:8545`)
   - Ensure correct network is selected
   - Clear MetaMask activity history if needed
   - Reset MetaMask account if nonce issues occur

2. **Contract Interaction Failures:**
   ```bash
   # Verify contract deployment
   # Foundry:
   forge script script/DeployCrowdFunding.s.sol --rpc-url http://localhost:8545
   
   # Hardhat:
   make contract-info
   ```

3. **Environment Variable Issues:**
   ```bash
   # Check .env file exists and is properly formatted
   # Ensure no extra spaces or quotes around values
   # Use absolute paths where needed
   ```

### IPFS/Pinata Issues

1. **Image Upload Failures:**
   - Verify Pinata JWT token is valid and not expired
   - Check file size limits (2MB per campaign recommended)
   - Ensure gateway URL is correct
   - Test API credentials in Pinata dashboard

2. **Image Loading Issues:**
   - Check if gateway URL is whitelisted in Next.js config
   - Verify image URL format matches gateway structure
   - Test CORS settings for your Pinata gateway

## 🔄 Development Workflows

### Smart Contract Modifications

#### Using Foundry:
```bash
cd forge_contract

# 1. Modify contracts
# 2. Test changes
make test

# 3. Deploy updated contract
make deploy-local

# 4. Update frontend config
# Copy contract address to .env
```

#### Using Hardhat:
```bash
cd my_web3

# 1. Modify contracts  
# 2. Test changes
make test

# 3. Deploy updated contract
make deploy-local

# 4. Update frontend config
make contract-info  # Shows deployed address
```

### Frontend Updates

```bash
cd frontend

# Update contract address in environment
# Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env

# Restart development server
npm run dev
```

### Testing Workflow

```bash
# Full test suite (choose toolchain)
cd forge_contract && make test     # Foundry
cd my_web3 && make test           # Hardhat

# Frontend integration tests
cd frontend && npm run test
```

## 🏆 Best Practices

### Smart Contract Development

**Universal Practices:**
- Always run comprehensive tests before deployment
- Use custom errors instead of `require` statements with strings
- Implement proper access control patterns
- Follow gas optimization techniques
- Document functions with NatSpec comments

**Foundry Specific:**
- Leverage fuzz testing for comprehensive coverage
- Use `forge-std` utilities for testing
- Take advantage of Rust-like error handling
- Use `--ir-minimum` flag for complex contracts

**Hardhat Specific:**
- Use TypeScript for deployment scripts
- Leverage comprehensive plugin ecosystem
- Use `hardhat-gas-reporter` for optimization
- Implement proper error handling in JavaScript tests

### Frontend Development

- **TypeScript**: Use strict typing for Web3 interactions
- **Error Handling**: Implement comprehensive error boundaries
- **React Patterns**: Use hooks and context effectively
- **Styling**: Maintain consistent Tailwind utility usage
- **Testing**: Write integration tests for smart contract interactions

### Version Control & Collaboration

- **Branch Strategy**: Use feature branches for new development
- **Commits**: Write clear, descriptive commit messages
- **Pull Requests**: Keep PRs focused and reviewable
- **Documentation**: Update README files when adding features

### Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use proper `.env` file management
- **Contract Verification**: Always verify contracts on testnets
- **Access Control**: Implement proper owner/role-based permissions
- **Testing**: Include negative test cases for all functions

## 🎯 Quick Reference Commands

| Task | Foundry | Hardhat |
|------|---------|---------|
| **Run Tests** | `make test` | `make test` |
| **Deploy Local** | `make deploy-local` | `make deploy-local` |
| **Deploy Sepolia** | `make deploy-sepolia` | `make deploy-sepolia` |
| **Gas Report** | `make test-gas` | `make test-gas` |
| **Clean Build** | `make clean` | `make clean` |
| **Coverage** | `make coverage` | `make test-coverage` |

Both implementations support Makefiles for consistent developer experience!

## 📚 Educational Value

This dual implementation demonstrates:

### **Technical Skills**
- **Smart Contract Architecture**: Library patterns, gas optimization, security practices
- **Testing Methodologies**: Solidity vs JavaScript testing approaches
- **Deployment Strategies**: Script-based vs programmatic deployment
- **Toolchain Expertise**: Proficiency in both major Ethereum development ecosystems

### **Professional Development**
- **Adaptability**: Working with different toolchains and languages
- **Best Practices**: Following industry standards across multiple frameworks
- **Documentation**: Comprehensive guides for complex technical implementations
- **Maintainability**: Consistent patterns across different technology stacks

## 📖 Further Learning Resources

### Foundry Resources
- [Foundry Book](https://book.getfoundry.sh/) - Official documentation
- [Foundry GitHub](https://github.com/foundry-rs/foundry) - Source code and examples
- [Foundry Templates](https://github.com/foundry-rs/forge-template) - Project templates

### Hardhat Resources  
- [Hardhat Documentation](https://hardhat.org/docs) - Complete guide
- [Hardhat Plugins](https://hardhat.org/plugins) - Ecosystem extensions
- [Hardhat Network](https://hardhat.org/hardhat-network) - Local development blockchain

### Smart Contract Security
- [OpenZeppelin](https://docs.openzeppelin.com/) - Security-focused contracts and guides
- [Consensys Security](https://consensys.github.io/smart-contract-best-practices/) - Best practices
- [Slither](https://github.com/crytic/slither) - Static analysis tool

## 🤝 Contributing

1. **Choose your preferred toolchain** (Foundry or Hardhat)
2. **Make changes** to the appropriate implementation
3. **Ensure both implementations remain synchronized** for identical functionality  
4. **Test thoroughly** using the respective toolchain's testing framework
5. **Update documentation** for any new features or changes

## 📝 License

MIT License - See LICENSE file for details

---

### 💡 Pro Tip

Start with the toolchain you're more familiar with, then explore the other implementation to understand the differences. Both achieve the same result but offer different developer experiences and learning opportunities!

**Happy Building! 🚀**
