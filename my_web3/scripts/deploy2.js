const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    // Deploy the contract
    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.waitForDeployment(); // Updated to use new ethers.js syntax

    // Get the deployed contract address
    const contractAddress = await crowdFunding.getAddress();
    console.log("Contract deployed to:", contractAddress);

    // Read campaigns from JSON file
    const campaignsPath = path.join(__dirname, "..", "campaigns.json");
    const campaignsData = fs.readFileSync(campaignsPath, "utf8");
    const campaigns = JSON.parse(campaignsData);

    // Create campaigns
    for (const campaign of campaigns) {
      const input = {
        title: campaign.title,
        description: campaign.description,
        target: BigInt(campaign.target),
        deadline: BigInt(campaign.deadline) + BigInt(1000000000),
        image: campaign.image,
        category: campaign.category,
        allowFlexibleWithdrawal: campaign.allowFlexibleWithdrawal || false,
      };

      const tx = await crowdFunding.createPublishedCampaign(input);

      await tx.wait();
      console.log(`Created campaign: ${campaign.title}`);
    }

    // Save the contract address to a file for frontend use
    const config = {
      contractAddress,
      network: hre.network.name,
    };

    const configDir = path.join(__dirname, "..", "config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    fs.writeFileSync(
      path.join(configDir, "contract-address.json"),
      JSON.stringify(config, null, 2)
    );

    console.log("All campaigns created successfully");
    console.log("Contract address saved to config/contract-address.json");
  } catch (error) {
    console.error("Error in deployment or campaign creation:", error);
    throw error; // Re-throw to ensure proper error handling
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
