const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("Deploying CrowdFunding contract...");

    // Deploy the contract
    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.waitForDeployment();

    // Get the deployed contract address
    const contractAddress = await crowdFunding.getAddress();
    console.log("✅ CrowdFunding contract deployed to:", contractAddress);
    console.log("Network:", hre.network.name);

    // Save the contract address to a file for frontend use
    const config = {
      contractAddress,
      network: hre.network.name,
      deployedAt: new Date().toISOString(),
    };

    const configDir = path.join(__dirname, "..", "config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    fs.writeFileSync(
      path.join(configDir, "contract-address.json"),
      JSON.stringify(config, null, 2)
    );

    console.log("✅ Contract address saved to config/contract-address.json");

    // Create sample campaigns if campaigns.json exists
    const campaignsPath = path.join(__dirname, "..", "campaigns.json");
    if (fs.existsSync(campaignsPath)) {
      console.log("\nCreating sample campaigns...");
      
      const campaignsData = fs.readFileSync(campaignsPath, "utf8");
      const campaigns = JSON.parse(campaignsData);

      for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        
        // Convert deadline to future timestamp (1 month from now)
        const futureDeadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        
        const campaignInput = {
          title: campaign.title,
          description: campaign.description,
          target: hre.ethers.parseEther(campaign.target.toString()),
          deadline: futureDeadline,
          image: campaign.image || "https://example.com/default-campaign-image.png",
          category: campaign.category || 0, // Default to Technology
          allowFlexibleWithdrawal: campaign.allowFlexibleWithdrawal || false,
        };

        try {
          // Create as published campaign if it has an image, otherwise as draft
          let tx;
          if (campaignInput.image && campaignInput.image !== "") {
            tx = await crowdFunding.createPublishedCampaign(campaignInput);
            console.log(`✅ Created published campaign: "${campaign.title}"`);
          } else {
            tx = await crowdFunding.createDraft(campaignInput);
            console.log(`✅ Created draft campaign: "${campaign.title}"`);
          }
          
          await tx.wait();
        } catch (error) {
          console.error(`❌ Failed to create campaign "${campaign.title}":`, error.message);
        }
      }

      console.log("\n✅ Sample campaigns creation completed");
    } else {
      console.log("\nNo campaigns.json file found, skipping sample campaign creation");
    }

    // Display deployment summary
    console.log("\n🎉 Deployment Summary:");
    console.log(`   Contract Address: ${contractAddress}`);
    console.log(`   Network: ${hre.network.name}`);
    console.log(`   Config saved to: config/contract-address.json`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
