-include .env

.PHONY: build deploy test test-fork clean remove install update zkbuild zktest snapshot format anvil zk-anvil deploy-sepolia deploy-zk deploy-zk-sepolia fund withdraw help

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
	@echo "Usage: make [target] [NETWORK=sepolia]"
	@echo "Targets:"
	@echo "  build: Build the project"
	@echo "  deploy: Deploy the contract (defaults to local Anvil, use NETWORK=sepolia for Sepolia)"
	@echo "  deploy-sepolia: Deploy the contract specifically to Sepolia (legacy, 'deploy NETWORK=sepolia' is preferred)"
	@echo "  test: Run the tests"
	@echo "  test-fork: Run the tests against a forked network (requires SEPOLIA_RPC_URL)"
	@echo "  clean: Clean the project"
	@echo "  remove: Remove git submodules and related files"
	@echo "  install: Install Foundry dependencies"
	@echo "  update: Update Foundry dependencies"
	@echo "  zkbuild: Build for zkSync"
	@echo "  zktest: Test for zkSync"
	@echo "  snapshot: Create a test snapshot"
	@echo "  format: Format Solidity files"
	@echo "  anvil: Run a local Anvil instance with deterministic accounts"
	@echo "  zk-anvil: Start a local zkSync development node"
	@echo "  deploy-zk: Deploy to local zkSync"
	@echo "  deploy-zk-sepolia: Deploy to zkSync Sepolia"
	@echo "  fund: Fund the deployed contract (requires SENDER_ADDRESS and deploy first)"
	@echo "  withdraw: Withdraw from the deployed contract (requires SENDER_ADDRESS and deploy first)"

# Clean the project
clean:
	forge clean

# Remove modules
remove:
	rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install:
	forge install cyfrin/foundry-devops@0.2.2 && forge install smartcontractkit/chainlink-brownie-contracts@1.1.1 && forge install foundry-rs/forge-std@v1.8.2

update:
	forge update

build:
	forge build

zkbuild:
	forge build --zksync

test:
	forge test

zktest:
	foundryup-zksync && forge test --zksync

test-fork:
	forge test --fork-url $(SEPOLIA_RPC_URL)

snapshot:
	forge snapshot

format:
	forge fmt

# Run anvil with deterministic accounts and 1-second block time
anvil:
	anvil -m 'test test test test test test test test test test test junk' \
		--steps-tracing \
		--block-time 1

zk-anvil:
	npx zksync-cli dev start

# Main deploy target - uses NETWORK_ARGS which is conditionally set above
deploy:
	forge script ${SCRIPT_FILE} ${NETWORK_ARGS}

# Specific deploy target for Sepolia (can be used, but 'deploy NETWORK=sepolia' is more flexible)
deploy-sepolia:
	forge script ${SCRIPT_FILE} --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

# As of writing, the Alchemy zkSync RPC URL is not working correctly
deploy-zk:
	forge create src/FundMe.sol:FundMe --rpc-url http://127.0.0.1:8011 --private-key $(DEFAULT_ZKSYNC_LOCAL_KEY) --constructor-args $(shell forge create test/mock/MockV3Aggregator.sol:MockV3Aggregator --rpc-url http://127.0.0.1:8011 --private-key $(DEFAULT_ZKSYNC_LOCAL_KEY) --constructor-args 8 200000000000 --legacy --zksync | grep "Deployed to:" | awk '{print $$3}') --legacy --zksync

deploy-zk-sepolia:
	forge create src/FundMe.sol:FundMe --rpc-url ${ZKSYNC_SEPOLIA_RPC_URL} --account default --constructor-args 0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF --legacy --zksync


# For deploying Interactions.s.sol:FundFundMe as well as for Interactions.s.sol:WithdrawFundMe we have to include a sender's address `--sender <ADDRESS>`
SENDER_ADDRESS ?= $(SENDER_ADDRESS)

fund:
	@forge script ${SCRIPT_FILE} --sender $(SENDER_ADDRESS) ${NETWORK_ARGS}

withdraw:
	@forge script ${SCRIPT_FILE} --sender $(SENDER_ADDRESS) ${NETWORK_ARGS}