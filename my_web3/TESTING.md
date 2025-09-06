# Testing the Hardhat CrowdFunding Implementation

## 🚀 Quick Start Commands

### Using the Makefile (Recommended)
```bash
# Show all available commands
make help

# Run all tests
make test

# Run tests with gas reporting
make test-gas

# Run tests with coverage
make test-coverage

# Build contracts
make build

# Deploy to local network
make deploy-local
```

### Using NPM Scripts Directly
```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Run test coverage
npm run test:coverage

# Build contracts
npm run build

# Deploy to local network
npm run deploy:local
```

## 🧪 Testing Options

### 1. Basic Test Run
```bash
make test
# or
npm test
```
**Output**: Runs all 21+ test cases covering:
- Contract deployment
- Campaign creation (draft & published)
- Campaign management (update, publish, cancel)
- Donation functionality
- Fund withdrawals
- Query functions and pagination
- Error handling
- Complete lifecycle integration

### 2. Gas Usage Analysis
```bash
make test-gas
# or
npm run test:gas
```
**Output**: Same tests but with detailed gas consumption reports for each function.

### 3. Test Coverage Report
```bash
make test-coverage
# or  
npm run test:coverage
```
**Output**: HTML coverage report showing which lines of code are tested.

## 🏗️ Development Workflow

### Complete Setup from Scratch
```bash
# 1. Install dependencies
make install

# 2. Check environment
make check-env

# 3. Build contracts
make build

# 4. Run tests
make test

# 5. Deploy locally
make deploy-local
```

### Testing Different Scenarios

#### Test Contract Compilation
```bash
make build
```

#### Test Deployment Scripts
```bash
# Start local network (in another terminal)
make node

# Deploy with sample campaigns
make deploy-local

# Or deploy just the contract
make deploy-basic-local
```

#### Test Gas Optimization
```bash
make test-gas
```
Look for:
- Campaign Creation: ~310,000 gas
- Donations: ~80,000 gas
- Withdrawals: ~62,000 gas

## 📊 Expected Test Results

### Successful Test Run Should Show:
```
✔ 32 passing tests
✔ 0 failing tests
✔ Coverage: Contract functions, edge cases, error handling
✔ Gas usage within expected ranges
```

### Key Test Categories:
1. **Deployment Tests** (2 tests) - Contract initialization
2. **Campaign Creation** (5 tests) - Draft and published workflows  
3. **Campaign Management** (3 tests) - Update, publish, cancel
4. **Donations** (2 tests) - Single and multiple donations
5. **Withdrawals** (3 tests) - Various withdrawal conditions
6. **Queries & Pagination** (4 tests) - Data retrieval functions
7. **Error Handling** (4 tests) - Invalid operations
8. **Integration** (1 test) - Complete campaign lifecycle
9. **Legacy Lock Contract** (8 tests) - From Hardhat template

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Tests Fail to Run
```bash
# Clean and rebuild
make clean-all
make install
make build
make test
```

#### Gas Usage Too High
```bash
# Check detailed gas usage
make gas-usage

# Compare with expected values in README
```

#### Deployment Issues
```bash
# Check if local network is running
make node

# In another terminal, deploy
make deploy-local

# Check deployment info
make contract-info
```

#### Environment Issues
```bash
# Check setup
make check-env

# Should show:
# - Node.js v16+
# - NPM installed
# - Hardhat installed: Yes
# - Dependencies: Installed
```

## 🌐 Network Testing

### Local Development
```bash
# Terminal 1: Start local network
make node

# Terminal 2: Deploy and test
make deploy-local
make accounts  # Show available test accounts
```

### Testnet (Sepolia)
```bash
# Requires .env file with:
# SEPOLIA_RPC_URL=...
# PRIVATE_KEY=...
# ETHERSCAN_API_KEY=...

make deploy-sepolia
make verify-sepolia
```

## 📈 Performance Benchmarks

### Expected Gas Costs:
- **createPublishedCampaign**: ~310,000 gas
- **donateToCampaign**: ~80,000 gas (first donation per user)
- **withdrawCampaignFunds**: ~62,000 gas
- **updateDraftCampaign**: ~78,000 gas
- **publishCampaign**: ~45,000 gas

### Test Execution Time:
- **Full test suite**: ~500ms
- **Individual test**: ~5-50ms
- **Gas reporting**: +100ms overhead

## 🎯 Success Criteria

Your Hardhat implementation is working correctly if:

1. ✅ All 32 tests pass
2. ✅ Gas usage within expected ranges
3. ✅ Contracts compile without warnings
4. ✅ Deployment scripts work on local network
5. ✅ Coverage reports show comprehensive testing
6. ✅ Contract verification scripts work (if testing on testnet)

## 💡 Pro Tips

- Use `make test-watch` for continuous testing during development
- Run `make full-test` before committing changes
- Use `make logs` to monitor background node activity
- Check `make contract-info` after deployment for addresses
- Use `make console-local` for interactive contract testing

Happy testing! 🚀