const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Contract verification script for Etherscan/block explorers
 * Reads contract address from deployment config and verifies on the current network
 */
async function main() {
  try {
    console.log("🔍 Starting contract verification...");
    console.log(`Network: ${hre.network.name}`);

    // Read contract address from config
    const configPath = path.join(__dirname, "..", "config", "contract-address.json");
    
    if (!fs.existsSync(configPath)) {
      throw new Error("Contract address config not found. Please deploy the contract first.");
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const { contractAddress, network } = config;

    console.log(`Contract address: ${contractAddress}`);
    console.log(`Config network: ${network}`);

    // Verify network matches
    if (network !== hre.network.name) {
      console.warn(`⚠️  Network mismatch: config shows ${network}, current network is ${hre.network.name}`);
      console.log("Proceeding with verification on current network...");
    }

    // Verify the contract
    console.log("\n📋 Verifying CrowdFunding contract...");
    
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // CrowdFunding constructor takes no arguments
    });

    console.log("✅ Contract verification completed!");
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Network: ${hre.network.name}`);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
      return;
    }
    
    console.error("❌ Verification failed:", error.message);
    
    if (error.message.includes("rate limit")) {
      console.log("\n💡 Tip: Try again in a few minutes due to API rate limits");
    } else if (error.message.includes("ETHERSCAN_API_KEY")) {
      console.log("\n💡 Tip: Make sure ETHERSCAN_API_KEY is set in your .env file");
    }
    
    process.exit(1);
  }
}

// Execute verification
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}

module.exports = { main };