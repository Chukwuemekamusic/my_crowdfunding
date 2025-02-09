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
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contract
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

    it("Should fail with invalid target amount", async function () {
      const invalidCampaign = {
        ...sampleCampaign,
        target: 0,
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidTarget");
    });

    it("Should fail with invalid deadline", async function () {
      const invalidCampaign = {
        ...sampleCampaign,
        deadline: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      await expect(
        crowdFunding.createCampaign(invalidCampaign)
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidDeadline");
    });
  });

  describe("Campaign Donations", function () {
    beforeEach(async function () {
      // Create a campaign before each test
      await crowdFunding.createCampaign(sampleCampaign);
    });

    it("Should accept donations successfully", async function () {
      const donationAmount = ethers.parseEther("0.5");

      const donationTx = await crowdFunding
        .connect(addr1)
        .donateToCampaign(0, { value: donationAmount });
      await donationTx.wait();

      const campaign = await crowdFunding.getCampaign(0, false);
      expect(campaign.amountCollected).to.equal(donationAmount);
    });

    it("Should fail with zero donation", async function () {
      await expect(
        crowdFunding.connect(addr1).donateToCampaign(0, { value: 0 })
      ).to.be.revertedWithCustomError(crowdFunding, "ZeroDonation");
    });

    it("Should track donor count correctly", async function () {
      const donationAmount = ethers.parseEther("0.1");

      // First donation from addr1
      await crowdFunding
        .connect(addr1)
        .donateToCampaign(0, { value: donationAmount });
      expect(await crowdFunding.getDonorCount(0)).to.equal(1);

      // Second donation from addr2
      await crowdFunding
        .connect(addr2)
        .donateToCampaign(0, { value: donationAmount });
      expect(await crowdFunding.getDonorCount(0)).to.equal(2);

      // Another donation from addr1 shouldn't increase donor count
      await crowdFunding
        .connect(addr1)
        .donateToCampaign(0, { value: donationAmount });
      expect(await crowdFunding.getDonorCount(0)).to.equal(2);
    });

    it("Should get correct donor info", async function () {
      const donationAmount = ethers.parseEther("0.5");
      await crowdFunding
        .connect(addr1)
        .donateToCampaign(0, { value: donationAmount });

      const [amount, timestamp, noOfDonations] =
        await crowdFunding.getDonorInfo(0, addr1.address);
      expect(amount).to.equal(donationAmount);
      expect(noOfDonations).to.equal(1);
    });
  });

  describe("Fund Withdrawal", function () {
    beforeEach(async function () {
      // Create a campaign with flexible withdrawal enabled
      const flexibleCampaign = {
        ...sampleCampaign,
        allowFlexibleWithdrawal: true,
      };

      await crowdFunding.createCampaign(flexibleCampaign);

      // Make a donation
      await crowdFunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });
    });

    it("Should allow withdrawal with flexible withdrawal enabled", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const withdrawTx = await crowdFunding.withdrawCampaignFunds(0);
      await withdrawTx.wait();

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail withdrawal if not campaign owner", async function () {
      await expect(
        crowdFunding.connect(addr1).withdrawCampaignFunds(0)
      ).to.be.revertedWithCustomError(crowdFunding, "NotCampaignOwner");
    });

    it("Should fail withdrawal with no balance", async function () {
      // Create a new campaign with no donations
      await crowdFunding.createCampaign(sampleCampaign);

      await expect(
        crowdFunding.withdrawCampaignFunds(1)
      ).to.be.revertedWithCustomError(crowdFunding, "InsufficientBalance");
    });

    it("Should track withdrawal amount correctly", async function () {
      await crowdFunding.withdrawCampaignFunds(0);
      const remainingBalance = await crowdFunding.getRemainingBalance(0);
      expect(remainingBalance).to.equal(0);
    });
  });

  describe("Campaign Updates and Status Changes", function () {
    beforeEach(async function () {
      // Create a draft campaign
      const draftCampaign = {
        ...sampleCampaign,
        publishImmediately: false,
      };
      await crowdFunding.createCampaign(draftCampaign);
    });

    it("Should update draft campaign successfully", async function () {
      const updateInput = {
        id: 0,
        title: "Updated Title",
        description: "Updated description",
        target: ethers.parseEther("2"),
        deadline: Math.floor(Date.now() / 1000) + 172800, // 48 hours from now
        image: "ipfs://updated-image-hash",
        category: 1, // Art
      };

      await crowdFunding.updateDraftCampaign(updateInput);

      const campaign = await crowdFunding.getCampaign(0, false);
      expect(campaign.title).to.equal(updateInput.title);
      expect(campaign.target).to.equal(updateInput.target);
    });

    it("Should fail to update published campaign", async function () {
      await crowdFunding.publishCampaign(0);

      const updateInput = {
        id: 0,
        title: "Updated Title",
        description: "Updated description",
        target: ethers.parseEther("2"),
        deadline: Math.floor(Date.now() / 1000) + 172800,
        image: "ipfs://updated-image-hash",
        category: 1,
      };

      await expect(
        crowdFunding.updateDraftCampaign(updateInput)
      ).to.be.revertedWithCustomError(crowdFunding, "NotDraftStatus");
    });

    it("Should cancel draft campaign", async function () {
      await crowdFunding.cancelDraftCampaign(0);
      const campaign = await crowdFunding.getCampaign(0, false);
      expect(campaign.status).to.equal(2); // Cancelled status
    });
  });

  describe("Campaign Queries and Pagination", function () {
    beforeEach(async function () {
      // Create multiple campaigns with different states
      await crowdFunding.createCampaign(sampleCampaign); // Published
      await crowdFunding.createCampaign({
        ...sampleCampaign,
        publishImmediately: false,
      }); // Draft
      await crowdFunding.createCampaign({
        ...sampleCampaign,
        category: 1,
      }); // Different category
    });

    it("Should retrieve all campaigns", async function () {
      const campaigns = await crowdFunding.getCampaigns();
      expect(campaigns.length).to.equal(3);
    });

    it("Should retrieve only published campaigns with pagination", async function () {
      const [campaigns, total] = await crowdFunding.getPublishedCampaigns({
        offset: 0,
        limit: 10,
      });
      expect(campaigns.length).to.equal(2);
      expect(total).to.equal(2);
    });

    it("Should handle pagination limits correctly", async function () {
      const [campaigns, total] = await crowdFunding.getPublishedCampaigns({
        offset: 1,
        limit: 1,
      });
      expect(campaigns.length).to.equal(1);
      expect(total).to.equal(2);
    });

    it("Should retrieve campaigns by category", async function () {
      const techCampaigns = await crowdFunding.getCampaignsByCategory(0);
      const artCampaigns = await crowdFunding.getCampaignsByCategory(1);

      expect(techCampaigns.length).to.equal(1);
      expect(artCampaigns.length).to.equal(1);
    });

    it("Should retrieve active campaigns", async function () {
      const activeCampaigns = await crowdFunding.getActiveCampaigns();
      expect(activeCampaigns.length).to.equal(2); // Two published campaigns
    });
  });
});
