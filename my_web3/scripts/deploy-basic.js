const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Basic deployment script for CrowdFunding contract
 * Only deploys the contract without creating sample campaigns
 */
async function main() {
  try {
    console.log("🚀 Starting CrowdFunding contract deployment...");
    console.log(`Network: ${hre.network.name}`);
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

    // Deploy the contract
    console.log("\n📋 Deploying CrowdFunding contract...");
    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    
    const crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.waitForDeployment();

    // Get contract details
    const contractAddress = await crowdFunding.getAddress();
    const owner = await crowdFunding.owner();
    
    console.log("✅ Contract deployed successfully!");
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Owner: ${owner}`);
    console.log(`   Initial campaign count: ${await crowdFunding.campaignCount()}`);

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      owner,
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployedAt: new Date().toISOString(),
      deployerAddress: deployer.address,
      initialCampaignCount: 0,
    };

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "..", "config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Save contract address for frontend
    fs.writeFileSync(
      path.join(configDir, "contract-address.json"),
      JSON.stringify({
        contractAddress,
        network: hre.network.name,
        deployedAt: deploymentInfo.deployedAt,
      }, null, 2)
    );

    // Save full deployment info
    fs.writeFileSync(
      path.join(configDir, "deployment-info.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Configuration files saved:");
    console.log(`   ✅ config/contract-address.json`);
    console.log(`   ✅ config/deployment-info.json`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Verify contract on Etherscan (if on testnet/mainnet):");
    console.log(`      npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    console.log("   2. Update your frontend configuration with the new contract address");
    console.log("   3. Test contract functionality with the test suite:");
    console.log("      npm run test");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}

module.exports = { main };