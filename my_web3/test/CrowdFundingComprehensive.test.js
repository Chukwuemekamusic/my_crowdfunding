const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrowdFunding Contract - Comprehensive Tests", function () {
  // Fixture for deploying the contract
  async function deployCrowdFundingFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();
    
    return { crowdFunding, owner, user1, user2, user3 };
  }

  // Helper function to create test campaign input
  function getTestCampaignInput() {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    return {
      title: "Test Campaign",
      description: "This is a test campaign for Hardhat testing",
      target: ethers.parseEther("1.0"), // 1 ETH target
      deadline: futureTimestamp,
      image: "https://example.com/test-image.png",
      category: 0, // Technology
      allowFlexibleWithdrawal: false
    };
  }

  function getTestCampaignInputFlexible() {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    return {
      title: "Flexible Test Campaign",
      description: "Test campaign with flexible withdrawal",
      target: ethers.parseEther("2.0"), // 2 ETH target
      deadline: futureTimestamp,
      image: "https://example.com/flexible-image.png",
      category: 1, // Art
      allowFlexibleWithdrawal: true
    };
  }

  describe("Deployment", function () {
    it("Should deploy successfully and set the correct owner", async function () {
      const { crowdFunding, owner } = await loadFixture(deployCrowdFundingFixture);
      
      expect(await crowdFunding.owner()).to.equal(owner.address);
      expect(await crowdFunding.campaignCount()).to.equal(0);
    });
  });

  describe("Campaign Creation", function () {
    describe("Draft Campaigns", function () {
      it("Should create a draft campaign successfully", async function () {
        const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
        const campaignInput = getTestCampaignInput();

        await expect(
          crowdFunding.connect(user1).createDraft(campaignInput)
        ).to.emit(crowdFunding, "CampaignCreated")
          .withArgs(0, user1.address, campaignInput.title, campaignInput.target, campaignInput.deadline, campaignInput.category);

        expect(await crowdFunding.campaignCount()).to.equal(1);
        
        const campaign = await crowdFunding.getCampaign(0, false);
        expect(campaign.owner).to.equal(user1.address);
        expect(campaign.title).to.equal(campaignInput.title);
        expect(campaign.status).to.equal(0); // Draft status
      });

      it("Should reject draft with invalid target", async function () {
        const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
        const invalidInput = { ...getTestCampaignInput(), target: 0 };

        await expect(
          crowdFunding.connect(user1).createDraft(invalidInput)
        ).to.be.revertedWithCustomError(crowdFunding, "CampaignLib_InvalidTarget");
      });

      it("Should reject draft with past deadline", async function () {
        const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
        const pastTimestamp = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
        const invalidInput = { ...getTestCampaignInput(), deadline: pastTimestamp };

        await expect(
          crowdFunding.connect(user1).createDraft(invalidInput)
        ).to.be.revertedWithCustomError(crowdFunding, "CampaignLib_InvalidDeadline");
      });
    });

    describe("Published Campaigns", function () {
      it("Should create a published campaign successfully", async function () {
        const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
        const campaignInput = getTestCampaignInput();

        await expect(
          crowdFunding.connect(user1).createPublishedCampaign(campaignInput)
        ).to.emit(crowdFunding, "CampaignCreated");

        const campaign = await crowdFunding.getCampaign(0, true);
        expect(campaign.status).to.equal(1); // Published status
      });

      it("Should reject published campaign without image", async function () {
        const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
        const invalidInput = { ...getTestCampaignInput(), image: "" };

        await expect(
          crowdFunding.connect(user1).createPublishedCampaign(invalidInput)
        ).to.be.revertedWithCustomError(crowdFunding, "ImageRequired");
      });
    });
  });

  describe("Campaign Management", function () {
    it("Should allow updating draft campaigns", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      // Create draft
      await crowdFunding.connect(user1).createDraft(campaignInput);

      // Update draft
      const futureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 2 days from now
      const updateInput = {
        id: 0,
        title: "Updated Test Campaign",
        description: "Updated description",
        target: ethers.parseEther("2.0"),
        deadline: futureTimestamp,
        image: "https://example.com/updated-image.png",
        category: 2 // Community
      };

      await expect(
        crowdFunding.connect(user1).updateDraftCampaign(updateInput)
      ).to.emit(crowdFunding, "CampaignUpdated").withArgs(0);

      const updatedCampaign = await crowdFunding.getCampaign(0, false);
      expect(updatedCampaign.title).to.equal("Updated Test Campaign");
      expect(updatedCampaign.target).to.equal(ethers.parseEther("2.0"));
    });

    it("Should allow publishing draft campaigns", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      // Create draft
      await crowdFunding.connect(user1).createDraft(campaignInput);

      // Publish campaign
      await expect(
        crowdFunding.connect(user1).publishCampaign(0)
      ).to.emit(crowdFunding, "CampaignPublished").withArgs(0, user1.address);

      const campaign = await crowdFunding.getCampaign(0, true);
      expect(campaign.status).to.equal(1); // Published status
    });

    it("Should allow cancelling draft campaigns", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      // Create draft
      await crowdFunding.connect(user1).createDraft(campaignInput);

      // Cancel draft
      await expect(
        crowdFunding.connect(user1).cancelDraftCampaign(0)
      ).to.emit(crowdFunding, "CampaignCancelled").withArgs(0, user1.address);

      const campaign = await crowdFunding.getCampaign(0, false);
      expect(campaign.status).to.equal(2); // Cancelled status
    });
  });

  describe("Donations", function () {
    it("Should accept donations to published campaigns", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      // Create and publish campaign
      await crowdFunding.connect(user1).createPublishedCampaign(campaignInput);

      const donationAmount = ethers.parseEther("0.1");

      await expect(
        crowdFunding.connect(user2).donateToCampaign(0, { value: donationAmount })
      ).to.emit(crowdFunding, "CampaignDonated")
        .withArgs(0, user2.address, donationAmount);

      const campaign = await crowdFunding.getCampaign(0, true);
      expect(campaign.amountCollected).to.equal(donationAmount);
      expect(campaign.donorCount).to.equal(1);

      // Check donor info
      const [amount, timestamp, noOfDonations] = await crowdFunding.getDonorInfo(0, user2.address);
      expect(amount).to.equal(donationAmount);
      expect(noOfDonations).to.equal(1);
    });

    it("Should handle multiple donations correctly", async function () {
      const { crowdFunding, user1, user2, user3 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      await crowdFunding.connect(user1).createPublishedCampaign(campaignInput);

      const donation1 = ethers.parseEther("0.1");
      const donation2 = ethers.parseEther("0.2");
      const donation3 = ethers.parseEther("0.15");

      // Multiple donations from different users
      await crowdFunding.connect(user2).donateToCampaign(0, { value: donation1 });
      await crowdFunding.connect(user3).donateToCampaign(0, { value: donation2 });
      await crowdFunding.connect(user2).donateToCampaign(0, { value: donation3 }); // Second donation from user2

      const campaign = await crowdFunding.getCampaign(0, true);
      expect(campaign.amountCollected).to.equal(donation1 + donation2 + donation3);
      expect(campaign.donorCount).to.equal(2); // Only 2 unique donors

      // Check user2's total donations
      const [user2Amount, , user2Donations] = await crowdFunding.getDonorInfo(0, user2.address);
      expect(user2Amount).to.equal(donation1 + donation3);
      expect(user2Donations).to.equal(2);
    });
  });

  describe("Fund Withdrawal", function () {
    it("Should allow withdrawal for flexible campaigns", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInputFlexible(); // Has flexible withdrawal

      await crowdFunding.connect(user1).createPublishedCampaign(campaignInput);

      const donationAmount = ethers.parseEther("0.5");
      await crowdFunding.connect(user2).donateToCampaign(0, { value: donationAmount });

      await expect(
        crowdFunding.connect(user1).withdrawCampaignFunds(0)
      ).to.emit(crowdFunding, "FundsWithdrawn")
        .withArgs(0, user1.address, donationAmount);

      const campaign = await crowdFunding.getCampaign(0, true);
      expect(campaign.withdrawnAmount).to.equal(donationAmount);
    });

    it("Should prevent withdrawal from active non-flexible campaigns", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput(); // No flexible withdrawal

      await crowdFunding.connect(user1).createPublishedCampaign(campaignInput);

      const donationAmount = ethers.parseEther("0.5");
      await crowdFunding.connect(user2).donateToCampaign(0, { value: donationAmount });

      await expect(
        crowdFunding.connect(user1).withdrawCampaignFunds(0)
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignLib_CampaignActive");
    });

    it("Should allow withdrawal after campaign deadline", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = {
        ...getTestCampaignInput(),
        deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };

      await crowdFunding.connect(user1).createPublishedCampaign(campaignInput);

      const donationAmount = ethers.parseEther("0.5");
      await crowdFunding.connect(user2).donateToCampaign(0, { value: donationAmount });

      // Fast forward time past the deadline
      await time.increaseTo(campaignInput.deadline + 1);

      await expect(
        crowdFunding.connect(user1).withdrawCampaignFunds(0)
      ).to.emit(crowdFunding, "FundsWithdrawn");
    });
  });

  describe("Campaign Queries and Pagination", function () {
    it("Should return published campaigns with pagination", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);

      // Create multiple published campaigns
      for (let i = 0; i < 5; i++) {
        const input = { ...getTestCampaignInput(), title: `Campaign ${i}` };
        await crowdFunding.connect(user1).createPublishedCampaign(input);
      }

      const paginationParams = { offset: 0, limit: 3 };
      const [campaigns, total] = await crowdFunding.getPublishedCampaigns(paginationParams);

      expect(campaigns.length).to.equal(3);
      expect(total).to.equal(5);
    });

    it("Should return user campaigns correctly", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);

      // Create campaigns from different users
      await crowdFunding.connect(user1).createDraft(getTestCampaignInput());
      await crowdFunding.connect(user1).createPublishedCampaign(getTestCampaignInput());
      await crowdFunding.connect(user2).createPublishedCampaign(getTestCampaignInput());

      const user1Campaigns = await crowdFunding.getUserCampaigns(user1.address);
      const user2Campaigns = await crowdFunding.getUserCampaigns(user2.address);

      expect(user1Campaigns.length).to.equal(2);
      expect(user2Campaigns.length).to.equal(1);
    });

    it("Should return campaigns by category", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);

      const techCampaign = { ...getTestCampaignInput(), category: 0, title: "Tech Campaign" };
      const artCampaign = { ...getTestCampaignInput(), category: 1, title: "Art Campaign" };

      await crowdFunding.connect(user1).createPublishedCampaign(techCampaign);
      await crowdFunding.connect(user1).createPublishedCampaign(artCampaign);

      const techCampaigns = await crowdFunding.getCampaignsByCategory(0); // Technology
      const artCampaigns = await crowdFunding.getCampaignsByCategory(1); // Art

      expect(techCampaigns.length).to.equal(1);
      expect(artCampaigns.length).to.equal(1);
      expect(techCampaigns[0].title).to.equal("Tech Campaign");
      expect(artCampaigns[0].title).to.equal("Art Campaign");
    });

    it("Should test active and completed campaign filtering", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);

      // Create campaigns with different deadlines
      const activeDeadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const shortDeadline = Math.floor(Date.now() / 1000) + 3600;  // 1 hour from now

      const activeCampaign = { ...getTestCampaignInput(), deadline: activeDeadline, title: "Active Campaign" };
      const shortCampaign = { ...getTestCampaignInput(), deadline: shortDeadline, title: "Short Campaign" };

      await crowdFunding.connect(user1).createPublishedCampaign(activeCampaign);
      await crowdFunding.connect(user1).createPublishedCampaign(shortCampaign);

      const paginationParams = { offset: 0, limit: 10 };

      // Test active campaigns (both should be active initially)
      const [activeCampaigns, activeTotal] = await crowdFunding.getActiveCampaigns(paginationParams);
      expect(activeTotal).to.equal(2);
      expect(activeCampaigns.length).to.equal(2);

      // Fast forward time to make one campaign expire
      await time.increaseTo(shortDeadline + 1);

      // Test after expiration
      const [activeCampaignsAfter, activeTotalAfter] = await crowdFunding.getActiveCampaigns(paginationParams);
      const [completedCampaigns, completedTotal] = await crowdFunding.getCompletedCampaigns(paginationParams);

      expect(activeTotalAfter).to.equal(1);
      expect(completedTotal).to.equal(1);
      expect(activeCampaignsAfter[0].title).to.equal("Active Campaign");
      expect(completedCampaigns[0].title).to.equal("Short Campaign");
    });
  });

  describe("Error Handling", function () {
    it("Should reject operations on non-existent campaigns", async function () {
      const { crowdFunding, user1 } = await loadFixture(deployCrowdFundingFixture);

      await expect(
        crowdFunding.connect(user1).donateToCampaign(999, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignNotFound");
    });

    it("Should handle getDonorInfo for non-donors correctly", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      
      await crowdFunding.connect(user1).createPublishedCampaign(getTestCampaignInput());

      await expect(
        crowdFunding.getDonorInfo(0, user2.address)
      ).to.be.revertedWithCustomError(crowdFunding, "NoDonationsMade");
    });

    it("Should reject zero donations", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      await crowdFunding.connect(user1).createPublishedCampaign(campaignInput);

      await expect(
        crowdFunding.connect(user2).donateToCampaign(0, { value: 0 })
      ).to.be.revertedWithCustomError(crowdFunding, "ZeroDonation");
    });

    it("Should prevent non-owners from managing campaigns", async function () {
      const { crowdFunding, user1, user2 } = await loadFixture(deployCrowdFundingFixture);
      const campaignInput = getTestCampaignInput();

      await crowdFunding.connect(user1).createDraft(campaignInput);

      // Test update by non-owner
      const updateInput = {
        id: 0,
        title: "Malicious Update",
        description: "Should fail",
        target: ethers.parseEther("1.0"),
        deadline: Math.floor(Date.now() / 1000) + 86400,
        image: "https://example.com/malicious.png",
        category: 0
      };

      await expect(
        crowdFunding.connect(user2).updateDraftCampaign(updateInput)
      ).to.be.revertedWithCustomError(crowdFunding, "NotCampaignOwner");

      // Test publish by non-owner
      await expect(
        crowdFunding.connect(user2).publishCampaign(0)
      ).to.be.revertedWithCustomError(crowdFunding, "NotCampaignOwner");

      // Test cancel by non-owner
      await expect(
        crowdFunding.connect(user2).cancelDraftCampaign(0)
      ).to.be.revertedWithCustomError(crowdFunding, "NotCampaignOwner");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete campaign lifecycle", async function () {
      const { crowdFunding, user1, user2, user3 } = await loadFixture(deployCrowdFundingFixture);

      // 1. Create draft campaign
      const campaignInput = getTestCampaignInputFlexible();
      await crowdFunding.connect(user1).createDraft(campaignInput);

      // 2. Update draft
      const updateInput = {
        id: 0,
        title: "Updated Campaign Title",
        description: campaignInput.description,
        target: ethers.parseEther("3.0"), // Increased target
        deadline: campaignInput.deadline,
        image: campaignInput.image,
        category: campaignInput.category
      };
      await crowdFunding.connect(user1).updateDraftCampaign(updateInput);

      // 3. Publish campaign
      await crowdFunding.connect(user1).publishCampaign(0);

      // 4. Multiple users donate
      await crowdFunding.connect(user2).donateToCampaign(0, { value: ethers.parseEther("1.0") });
      await crowdFunding.connect(user3).donateToCampaign(0, { value: ethers.parseEther("0.5") });
      await crowdFunding.connect(user2).donateToCampaign(0, { value: ethers.parseEther("0.3") }); // Second donation

      // 5. Verify campaign state
      const campaign = await crowdFunding.getCampaign(0, true);
      expect(campaign.title).to.equal("Updated Campaign Title");
      expect(campaign.target).to.equal(ethers.parseEther("3.0"));
      expect(campaign.amountCollected).to.equal(ethers.parseEther("1.8"));
      expect(campaign.donorCount).to.equal(2); // user2 and user3

      // 6. Check donor info
      const [user2Amount, , user2Donations] = await crowdFunding.getDonorInfo(0, user2.address);
      expect(user2Amount).to.equal(ethers.parseEther("1.3"));
      expect(user2Donations).to.equal(2);

      // 7. Withdraw funds (flexible withdrawal allowed)
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      await crowdFunding.connect(user1).withdrawCampaignFunds(0);
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);

      // 8. Verify withdrawal amount
      const campaignAfterWithdraw = await crowdFunding.getCampaign(0, true);
      expect(campaignAfterWithdraw.withdrawnAmount).to.equal(ethers.parseEther("1.8"));
    });
  });
});