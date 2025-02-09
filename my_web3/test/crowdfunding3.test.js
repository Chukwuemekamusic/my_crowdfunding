const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding", function () {
  let crowdFunding;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let currentTimestamp;

  // Category enum
  const Category = {
    Technology: 0,
    Art: 1,
    Community: 2,
    Business: 3,
    Charity: 4,
    Other: 5,
  };

  async function getCurrentBlockTimestamp() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    return block.timestamp;
  }

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Get current block timestamp
    currentTimestamp = await getCurrentBlockTimestamp();

    // Create sample campaign with blockchain timestamp
    sampleCampaign = {
      title: "Test Campaign",
      description: "A test campaign description",
      target: ethers.parseEther("1"),
      deadline: currentTimestamp + 86400, // 24 hours from now
      image: "ipfs://sample-image-hash",
      category: Category.Technology, // Using enum value
      publishImmediately: true,
      allowFlexibleWithdrawal: false,
    };

    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.waitForDeployment();
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const tx = await crowdFunding.createCampaign(sampleCampaign);
      await tx.wait();

      const campaign = await crowdFunding.getCampaign(0, false);
      expect(campaign.title).to.equal(sampleCampaign.title);
      expect(campaign.target).to.equal(sampleCampaign.target);
      expect(campaign.status).to.equal(1); // Published status
    });

    it("Should fail with InvalidTarget error for zero target", async function () {
      const invalidCampaign = {
        ...sampleCampaign,
        target: 0,
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidTarget");
    });

    it("Should fail with InvalidDeadline error for past deadline", async function () {
      const invalidCampaign = {
        ...sampleCampaign,
        deadline: currentTimestamp - 3600, // 1 hour ago
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidDeadline");
    });

    it("Should fail with InvalidCategory error for invalid category", async function () {
      // Using a number larger than the highest enum value (Other = 5)
      const invalidCampaign = {
        ...sampleCampaign,
        category: Category.Other + 1, // This will be 6, which is invalid
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidCategory");
    });
  });

  describe("Time-dependent operations", function () {
    it("Should allow withdrawal after deadline", async function () {
      // Get current timestamp
      const timestamp = await getCurrentBlockTimestamp();

      // Create campaign with deadline 100 seconds in the future
      const campaign = {
        ...sampleCampaign,
        deadline: timestamp + 100,
      };

      await crowdFunding.createCampaign(campaign);

      // Make donation
      await crowdFunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      // Fast forward time past deadline
      await ethers.provider.send("evm_increaseTime", [150]); // Increase time by 150 seconds
      await ethers.provider.send("evm_mine"); // Mine a new block

      // Should now be able to withdraw
      await expect(crowdFunding.withdrawCampaignFunds(0)).to.not.be.reverted;
    });
  });

  // ... rest of the test file remains the same ...
});
