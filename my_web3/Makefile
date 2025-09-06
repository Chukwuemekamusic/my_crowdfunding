# Makefile for CrowdFunding Hardhat Project
# ==========================================

# Colors for output
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Default target
.DEFAULT_GOAL := help

# Project info
PROJECT_NAME := CrowdFunding Hardhat
VERSION := 2.0.0

# =============================================================================
# HELP
# =============================================================================

help: ## Show this help message
	@echo "$(BLUE)$(PROJECT_NAME) v$(VERSION)$(RESET)"
	@echo "======================================"
	@echo ""
	@echo "$(GREEN)Available targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Quick Start:$(RESET)"
	@echo "  make install     # Install dependencies"
	@echo "  make test        # Run all tests"
	@echo "  make deploy-local # Deploy to local network"

# =============================================================================
# DEVELOPMENT
# =============================================================================

install: ## Install project dependencies
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	npm install

clean: ## Clean build artifacts and cache
	@echo "$(GREEN)Cleaning build artifacts...$(RESET)"
	npm run clean
	rm -rf node_modules/.cache
	rm -rf cache/
	rm -rf artifacts/

build: ## Compile smart contracts
	@echo "$(GREEN)Compiling contracts...$(RESET)"
	npm run build

rebuild: clean build ## Clean and rebuild contracts
	@echo "$(GREEN)Rebuild completed!$(RESET)"

# =============================================================================
# TESTING
# =============================================================================

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(RESET)"
	npm test

test-gas: ## Run tests with gas reporting
	@echo "$(GREEN)Running tests with gas reporting...$(RESET)"
	npm run test:gas

test-coverage: ## Run tests with coverage report
	@echo "$(GREEN)Running test coverage...$(RESET)"
	npm run test:coverage

test-watch: ## Run tests in watch mode (requires nodemon)
	@echo "$(GREEN)Running tests in watch mode...$(RESET)"
	@if command -v nodemon > /dev/null; then \
		nodemon --exec "npm test" --watch test --watch contracts; \
	else \
		echo "$(RED)nodemon not found. Install with: npm install -g nodemon$(RESET)"; \
	fi

# =============================================================================
# LOCAL DEVELOPMENT
# =============================================================================

node: ## Start local Hardhat network
	@echo "$(GREEN)Starting Hardhat network...$(RESET)"
	npm run node

node-bg: ## Start local Hardhat network in background
	@echo "$(GREEN)Starting Hardhat network in background...$(RESET)"
	nohup npm run node > hardhat-node.log 2>&1 & echo $$! > hardhat-node.pid
	@echo "Network started. PID saved to hardhat-node.pid, logs in hardhat-node.log"

stop-node: ## Stop background Hardhat network
	@if [ -f hardhat-node.pid ]; then \
		echo "$(GREEN)Stopping Hardhat network...$(RESET)"; \
		kill `cat hardhat-node.pid` && rm hardhat-node.pid; \
		echo "Network stopped."; \
	else \
		echo "$(YELLOW)No background network running.$(RESET)"; \
	fi

deploy-local: ## Deploy contracts to local network
	@echo "$(GREEN)Deploying to local network...$(RESET)"
	npm run deploy:local

deploy-basic-local: ## Deploy contracts to local network (no samples)
	@echo "$(GREEN)Deploying basic contract to local network...$(RESET)"
	npm run deploy:basic:local

# =============================================================================
# TESTNET DEPLOYMENT
# =============================================================================

deploy-sepolia: ## Deploy contracts to Sepolia testnet
	@echo "$(GREEN)Deploying to Sepolia testnet...$(RESET)"
	@echo "$(YELLOW)Make sure you have SEPOLIA_RPC_URL and PRIVATE_KEY set in .env$(RESET)"
	npm run deploy:sepolia

deploy-basic-sepolia: ## Deploy contracts to Sepolia testnet (no samples)
	@echo "$(GREEN)Deploying basic contract to Sepolia testnet...$(RESET)"
	@echo "$(YELLOW)Make sure you have SEPOLIA_RPC_URL and PRIVATE_KEY set in .env$(RESET)"
	npm run deploy:basic:sepolia

verify-sepolia: ## Verify deployed contract on Sepolia
	@echo "$(GREEN)Verifying contract on Sepolia...$(RESET)"
	@echo "$(YELLOW)Make sure you have ETHERSCAN_API_KEY set in .env$(RESET)"
	npm run verify:sepolia

# =============================================================================
# CONTRACT INTERACTION
# =============================================================================

console-local: ## Open Hardhat console connected to local network
	@echo "$(GREEN)Opening Hardhat console (local network)...$(RESET)"
	npx hardhat console --network localhost

console-sepolia: ## Open Hardhat console connected to Sepolia
	@echo "$(GREEN)Opening Hardhat console (Sepolia network)...$(RESET)"
	npx hardhat console --network sepolia

accounts: ## Show available accounts
	@echo "$(GREEN)Available accounts:$(RESET)"
	npx hardhat run scripts/show-accounts.js --network localhost

# =============================================================================
# QUALITY ASSURANCE
# =============================================================================

lint: ## Run code linting (if configured)
	@echo "$(GREEN)Running linter...$(RESET)"
	@if [ -f .eslintrc.js ] || [ -f .eslintrc.json ]; then \
		npx eslint . --ext .js; \
	else \
		echo "$(YELLOW)ESLint not configured. Skipping...$(RESET)"; \
	fi

format: ## Format code (if prettier is configured)
	@echo "$(GREEN)Formatting code...$(RESET)"
	@if command -v prettier > /dev/null; then \
		prettier --write "**/*.{js,json,md}"; \
	else \
		echo "$(YELLOW)Prettier not found. Skipping...$(RESET)"; \
	fi

audit: ## Run npm security audit
	@echo "$(GREEN)Running security audit...$(RESET)"
	npm audit

audit-fix: ## Fix npm security issues
	@echo "$(GREEN)Fixing security issues...$(RESET)"
	npm audit fix

# =============================================================================
# UTILITIES
# =============================================================================

size: ## Show contract size information
	@echo "$(GREEN)Contract size information:$(RESET)"
	npx hardhat size-contracts

gas-usage: ## Show detailed gas usage
	@echo "$(GREEN)Detailed gas usage:$(RESET)"
	REPORT_GAS=true npm test | grep -A 50 "Gas usage"

contract-info: ## Show deployed contract information
	@echo "$(GREEN)Deployed contract information:$(RESET)"
	@if [ -f config/contract-address.json ]; then \
		cat config/contract-address.json | jq .; \
	else \
		echo "$(RED)No deployment found. Run 'make deploy-local' first.$(RESET)"; \
	fi

logs: ## Show Hardhat node logs (if running in background)
	@if [ -f hardhat-node.log ]; then \
		tail -f hardhat-node.log; \
	else \
		echo "$(RED)No log file found. Is the node running in background?$(RESET)"; \
	fi

# =============================================================================
# DEVELOPMENT WORKFLOW
# =============================================================================

dev-setup: install build ## Complete development setup
	@echo "$(GREEN)Development setup complete!$(RESET)"
	@echo "$(YELLOW)Next steps:$(RESET)"
	@echo "  1. Copy .env.example to .env and configure"
	@echo "  2. Run 'make test' to verify everything works"
	@echo "  3. Run 'make deploy-local' to deploy locally"

full-test: clean build test test-gas ## Clean, build, and run all tests
	@echo "$(GREEN)Full test suite completed!$(RESET)"

deploy-and-verify-sepolia: deploy-sepolia verify-sepolia ## Deploy and verify on Sepolia
	@echo "$(GREEN)Deployment and verification on Sepolia completed!$(RESET)"

# =============================================================================
# CI/CD TARGETS
# =============================================================================

ci-install: ## Install dependencies for CI
	npm ci

ci-test: ci-install build test ## Run CI test suite
	@echo "$(GREEN)CI tests completed!$(RESET)"

ci-coverage: ci-install build test-coverage ## Run CI with coverage
	@echo "$(GREEN)CI coverage completed!$(RESET)"

# =============================================================================
# CLEANUP
# =============================================================================

clean-all: clean stop-node ## Clean everything including background processes
	rm -f hardhat-node.log
	rm -f hardhat-node.pid
	rm -rf config/
	@echo "$(GREEN)Complete cleanup finished!$(RESET)"

# =============================================================================
# ENVIRONMENT CHECKS
# =============================================================================

check-env: ## Check environment setup
	@echo "$(GREEN)Checking environment setup...$(RESET)"
	@echo "Node.js version: $$(node --version)"
	@echo "NPM version: $$(npm --version)"
	@echo "Hardhat installed: $$(if [ -f node_modules/.bin/hardhat ]; then echo 'Yes'; else echo 'No'; fi)"
	@echo "Environment file: $$(if [ -f ../.env ]; then echo 'Found'; else echo 'Missing (.env)'; fi)"
	@echo "Dependencies: $$(if [ -d node_modules ]; then echo 'Installed'; else echo 'Run make install'; fi)"

# =============================================================================
# PHONY TARGETS
# =============================================================================

.PHONY: help install clean build rebuild test test-gas test-coverage test-watch \
        node node-bg stop-node deploy-local deploy-basic-local deploy-sepolia \
        deploy-basic-sepolia verify-sepolia console-local console-sepolia \
        accounts lint format audit audit-fix size gas-usage contract-info logs \
        dev-setup full-test deploy-and-verify-sepolia ci-install ci-test \
        ci-coverage clean-all check-env