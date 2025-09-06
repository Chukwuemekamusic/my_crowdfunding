-include .env

.PHONY: build deploy test test-fork clean remove install update snapshot format anvil deploy-sepolia copy-abi help

# Default private key for Anvil's deterministic accounts
DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Default RPC URL for Anvil
DEFAULT_ANVIL_RPC_URL := http://localhost:8545

# Define the script file to be deployed
SCRIPT_FILE := script/DeployCrowdFunding.s.sol:DeployCrowdFundingWithCampaigns

# --- NETWORK CONFIGURATION ---
# Default NETWORK_ARGS for local Anvil deployment
# This uses the '?' operator, meaning it will only set NETWORK_ARGS if it hasn't been set already.
NETWORK_ARGS ?= --rpc-url $(DEFAULT_ANVIL_RPC_URL) --private-key $(DEFAULT_ANVIL_KEY) --broadcast

# Conditional override for NETWORK_ARGS if 'NETWORK=sepolia' is passed on the command line
# This checks the 'NETWORK' variable, which you set when running 'make'.
ifeq ($(NETWORK), sepolia)
    NETWORK_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
endif
# --- END NETWORK CONFIGURATION ---


help:
	@echo "🚀 Crowdfunding DApp - Makefile Commands"
	@echo "========================================"
	@echo ""
	@echo "📋 Usage: make [target] [NETWORK=sepolia]"
	@echo ""
	@echo "🔨 Build & Test:"
	@echo "  build          Build the smart contracts"
	@echo "  test           Run all tests"
	@echo "  test-fork      Run tests against forked Sepolia network"
	@echo "  snapshot       Create gas usage snapshot"
	@echo "  format         Format Solidity files"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  deploy         Deploy to local Anvil (default) or Sepolia (NETWORK=sepolia)"
	@echo "  deploy-sepolia Deploy specifically to Sepolia testnet"
	@echo ""
	@echo "🛠️  Development:"
	@echo "  anvil          Start local Anvil blockchain"
	@echo "  copy-abi       Copy contract ABI to frontend"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  clean          Clean build artifacts"
	@echo "  install        Install Foundry dependencies"
	@echo "  update         Update Foundry dependencies"
	@echo "  remove         Remove git submodules"
	@echo ""
	@echo "💡 Examples:"
	@echo "  make deploy                    # Deploy to local Anvil"
	@echo "  make deploy NETWORK=sepolia    # Deploy to Sepolia testnet"
	@echo "  make test                      # Run all tests"

# ============================================================================
# BUILD & TEST COMMANDS
# ============================================================================

build:
	@echo "🔨 Building smart contracts..."
	forge build
	@echo "✅ Build completed!"

test:
	@echo "🧪 Running tests..."
	forge test
	@echo "✅ Tests completed!"

test-fork:
	@echo "🌐 Running tests against Sepolia fork..."
	forge test --fork-url $(SEPOLIA_RPC_URL)
	@echo "✅ Fork tests completed!"

snapshot:
	@echo "📊 Creating gas snapshot..."
	forge snapshot
	@echo "✅ Snapshot created!"

format:
	@echo "🎨 Formatting Solidity files..."
	forge fmt
	@echo "✅ Formatting completed!"

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

# Copy ABI to frontend after build
copy-abi:
	@echo "📋 Copying ABI to frontend..."
	@cp out/CrowdFunding.sol/CrowdFunding.json ../frontend/constants/CrowdFunding.json
	@echo "✅ ABI copied successfully!"

# Clean the project
clean:
	@echo "🧹 Cleaning build artifacts..."
	forge clean
	@echo "✅ Clean completed!"

# Install dependencies
install:
	@echo "📦 Installing Foundry dependencies..."
	forge install cyfrin/foundry-devops@0.2.2 && forge install smartcontractkit/chainlink-brownie-contracts@1.1.1 && forge install foundry-rs/forge-std@v1.8.2
	@echo "✅ Dependencies installed!"

# Update dependencies
update:
	@echo "🔄 Updating Foundry dependencies..."
	forge update
	@echo "✅ Dependencies updated!"

# Remove modules
remove:
	@echo "🗑️  Removing git submodules..."
	rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"
	@echo "✅ Modules removed!"

# ============================================================================
# DEVELOPMENT COMMANDS
# ============================================================================

# Run anvil with deterministic accounts and 1-second block time
anvil:
	@echo "🔗 Starting local Anvil blockchain..."
	anvil -m 'test test test test test test test test test test test junk' \
		--steps-tracing \
		--block-time 1



# ============================================================================
# DEPLOYMENT COMMANDS
# ============================================================================

# Main deploy target - uses NETWORK_ARGS which is conditionally set above
deploy:
	@echo "🚀 Deploying contracts..."
	forge script ${SCRIPT_FILE} ${NETWORK_ARGS}
	@echo "📋 Copying ABI to frontend..."
	@cp out/CrowdFunding.sol/CrowdFunding.json ../frontend/constants/CrowdFunding.json
	@echo "✅ Deployment completed!"

# Specific deploy target for Sepolia (can be used, but 'deploy NETWORK=sepolia' is more flexible)
deploy-sepolia:
	@echo "🌐 Deploying to Sepolia testnet..."
	forge script ${SCRIPT_FILE} --rpc-url $(SEPOLIA_RPC_URL) --account $(ACCOUNT_NAME) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
	@echo "📋 Copying ABI to frontend..."
	@cp out/CrowdFunding.sol/CrowdFunding.json ../frontend/constants/CrowdFunding.json
	@echo "✅ Sepolia deployment completed!"


