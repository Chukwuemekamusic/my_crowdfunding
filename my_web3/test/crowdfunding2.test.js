const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding", function () {
  let crowdFunding;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Sample campaign input
  const sampleCampaign = {
    title: "Test Campaign",
    description: "A test campaign description",
    target: ethers.parseEther("1"),
    deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    image: "ipfs://sample-image-hash",
    category: 0, // Technology
    publishImmediately: true,
    allowFlexibleWithdrawal: false,
  };

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

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
        deadline: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidDeadline");
    });

    it("Should fail with InvalidCategory error for invalid category", async function () {
      const invalidCampaign = {
        ...sampleCampaign,
        category: 6, // Invalid category (only 0-5 are valid)
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidCategory");
    });
  });

  describe("Campaign Donations", function () {
    beforeEach(async function () {
      await crowdFunding.createCampaign(sampleCampaign);
    });

    it("Should fail with ZeroDonation error for zero amount", async function () {
      await expect(
        crowdFunding.connect(addr1).donateToCampaign(0, { value: 0 })
      ).to.be.revertedWithCustomError(crowdFunding, "ZeroDonation");
    });

    it("Should fail with CampaignNotPublished error for draft campaign", async function () {
      // Create a draft campaign
      await crowdFunding.createCampaign({
        ...sampleCampaign,
        publishImmediately: false,
      });

      await expect(
        crowdFunding.connect(addr1).donateToCampaign(1, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignNotPublished");
    });

    it("Should fail with CampaignEnded error for expired campaign", async function () {
      // First create a campaign with valid deadline
      const campaign = {
        ...sampleCampaign,
        deadline: Math.floor(Date.now() / 1000) + 100, // 100 seconds from now
      };

      await crowdFunding.createCampaign(campaign);

      // Fast forward time to after deadline
      await ethers.provider.send("evm_increaseTime", [150]); // Increase time by 150 seconds
      await ethers.provider.send("evm_mine"); // Mine a new block

      // Try to donate to expired campaign
      await expect(
        crowdFunding.connect(addr1).donateToCampaign(1, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignEnded");
    });
  });

  describe("Fund Withdrawal", function () {
    beforeEach(async function () {
      await crowdFunding.createCampaign({
        ...sampleCampaign,
        allowFlexibleWithdrawal: false,
      });
      await crowdFunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });
    });

    it("Should fail with CampaignActive error for early withdrawal", async function () {
      await expect(
        crowdFunding.withdrawCampaignFunds(0)
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignActive");
    });

    it("Should fail with NotCampaignOwner error for non-owner withdrawal", async function () {
      await expect(
        crowdFunding.connect(addr1).withdrawCampaignFunds(0)
      ).to.be.revertedWithCustomError(crowdFunding, "NotCampaignOwner");
    });

    it("Should fail with InsufficientBalance error for empty campaign", async function () {
      // Create a new campaign without donations
      await crowdFunding.createCampaign(sampleCampaign);

      await expect(
        crowdFunding.withdrawCampaignFunds(1)
      ).to.be.revertedWithCustomError(crowdFunding, "InsufficientBalance");
    });
  });

  describe("Campaign Queries", function () {
    it("Should fail with CampaignNotFound error for invalid campaign ID", async function () {
      await expect(
        crowdFunding.getCampaign(999, false)
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignNotFound");
    });

    it("Should fail with NoDonationsMade error for non-donor query", async function () {
      await crowdFunding.createCampaign(sampleCampaign);

      await expect(
        crowdFunding.getDonorInfo(0, addr1.address)
      ).to.be.revertedWithCustomError(crowdFunding, "NoDonationsMade");
    });
  });

  describe("Time-dependent operations", function () {
    it("Should allow withdrawal after deadline", async function () {
      // Create campaign
      await crowdFunding.createCampaign({
        ...sampleCampaign,
        deadline: Math.floor(Date.now() / 1000) + 100, // 100 seconds from now
      });

      // Make donation
      await crowdFunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      // Fast forward time past deadline
      await ethers.provider.send("evm_increaseTime", [200]); // Increase time by 200 seconds
      await ethers.provider.send("evm_mine"); // Mine a new block

      // Should now be able to withdraw
      await expect(crowdFunding.withdrawCampaignFunds(0)).to.not.be.reverted;
    });
  });
});
