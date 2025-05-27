// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {CrowdFunding} from "../src/CrowdFunding.sol";
import {DeployCrowdFundingWithCampaigns} from "../script/DeployCrowdFunding.s.sol";

// Test to run
// ✓ test createDraft
// ✓ test createPublishedCampaign
// ✓ test publishCampaign
// ✓ test getCampaign
// ✓ test donateToCampaign
// ✓ test getDonorInfo
// ✓ test getDonorInfo_MoreThanOneDonation
// ✓ test withdrawDonation
// ✓ test DonorCount
// TODO: test getCampaigns
// TODO: test cancelDraftCampaign

contract CrowdFundingTest is Test {
    CrowdFunding public crowdFunding;
    address USER = makeAddr("user");
    address ALICE = makeAddr("alice");
    uint256 constant STARTING_USER_BALANCE = 10 ether;
    uint256 constant SEND_VALUE = 0.1 ether;
    DeployCrowdFundingWithCampaigns deployCrowdFunding;

    function getTestCampaignInput()
        internal
        view
        returns (CrowdFunding.CampaignInput memory)
    {
        return
            CrowdFunding.CampaignInput({
                title: "Test Campaign",
                description: "This is a test campaign",
                target: 100,
                deadline: block.timestamp + 1000,
                image: "https://example.com/image.png",
                category: CrowdFunding.Category.Technology,
                allowFlexibleWithdrawal: false
            });
    }

    function getTestCampaignInputFlexibleWithdrawal()
        internal
        view
        returns (CrowdFunding.CampaignInput memory)
    {
        return
            CrowdFunding.CampaignInput({
                title: "Test Campaign",
                description: "This is a test campaign",
                target: 100,
                deadline: block.timestamp + 1000,
                image: "https://example.com/image.png",
                category: CrowdFunding.Category.Technology,
                allowFlexibleWithdrawal: true
            });
    }

    function setUp() public {
        deployCrowdFunding = new DeployCrowdFundingWithCampaigns();
        crowdFunding = deployCrowdFunding.run();
        console.log("\n\n");
        console.log("vm signer:", vm.addr(1));
        console.log("deployCrowdFunding address:", address(deployCrowdFunding));
        console.log("crowdFunding address:", address(crowdFunding));
        console.log("crowdFunding owner:", address(crowdFunding.getOwner()));
        console.log("test contract address:", address(this));
        vm.deal(USER, STARTING_USER_BALANCE);
    }

    function test_CrowdFunding_Deployment() public view {
        // vm.prank(USER);
        assertTrue(address(crowdFunding) != address(0));
    }

    function test_createDraft() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        // verify that the campaign is created
        assertEq(crowdFunding.campaignCount(), campaignCount + 1);

        // verify that the campaign is in draft status
        assertEq(
            uint8(crowdFunding.getCampaignStatus(campaignCount)),
            uint8(CrowdFunding.CampaignStatus.Draft)
        );

        CrowdFunding.Campaign memory campaign = crowdFunding.getCampaign(
            campaignCount,
            false
        );
        assertEq(campaign.owner, USER);
        assertEq(campaign.title, "Test Campaign");
        assertEq(campaign.target, 100);
        vm.stopPrank();
    }

    function test_createPublishedCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        // verify that the campaign is created
        assertEq(crowdFunding.campaignCount(), campaignCount + 1);

        // verify that the campaign is in draft status
        assertEq(
            uint8(crowdFunding.getCampaignStatus(campaignCount)),
            uint8(CrowdFunding.CampaignStatus.Published)
        );

        CrowdFunding.Campaign memory campaign = crowdFunding.getCampaign(
            campaignCount,
            true
        );
        assertEq(campaign.owner, USER);
        assertEq(campaign.title, "Test Campaign");
        assertEq(campaign.target, 100);
        vm.stopPrank();
    }

    function test_getCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        CrowdFunding.Campaign memory campaign = crowdFunding.getCampaign(
            campaignCount,
            false
        );
        assertEq(campaign.owner, USER);
        assertEq(campaign.title, "Test Campaign");

        // verify that it doesn't return a published campaign
        vm.expectRevert(CrowdFunding.CampaignNotPublished.selector);
        crowdFunding.getCampaign(campaignCount, true);

        // verify that it doesn't return a campaign that doesn't exist
        vm.expectRevert(CrowdFunding.CampaignNotFound.selector);
        crowdFunding.getCampaign(campaignCount + 1, true);

        vm.stopPrank();
    }

    function test_publishCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        crowdFunding.publishCampaign(campaignCount);

        // verify that the campaign is published
        assertEq(
            uint8(crowdFunding.getCampaignStatus(campaignCount)),
            uint8(CrowdFunding.CampaignStatus.Published)
        );

        vm.stopPrank();
    }

    function test_donateToCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        crowdFunding.donateToCampaign{value: 10}(campaignCount);

        CrowdFunding.Campaign memory campaign = crowdFunding.getCampaign(
            campaignCount,
            true
        );

        // verify that the campaign has received the donation
        assertEq(campaign.amountCollected, 10);

        // verify that the campaign has received the donation
        assertEq(campaign.donorCount, 1);

        // verify that the donor list is updated
        vm.stopPrank();
    }

    function test_getDonorInfo() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        (uint256 amount, uint256 timestamp, uint16 noOfDonations) = crowdFunding
            .getDonorInfo(campaignCount, USER);
        assertEq(amount, 10);
        assertEq(timestamp, block.timestamp);
        assertEq(noOfDonations, 1);
    }

    function test_getDonorInfo_MoreThanOneDonation() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        crowdFunding.donateToCampaign{value: 20}(campaignCount);
        (uint256 amount, uint256 timestamp, uint16 noOfDonations) = crowdFunding
            .getDonorInfo(campaignCount, USER);
        assertEq(amount, 30);
        assertEq(timestamp, block.timestamp);
        assertEq(noOfDonations, 2);
    }

    function test_DonorCount() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());
        assertEq(crowdFunding.getDonorCount(campaignCount), 0);
        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        assertEq(crowdFunding.getDonorCount(campaignCount), 1);

        // verify that second donation by same donor doesn not increase the donor count
        crowdFunding.donateToCampaign{value: 20}(campaignCount);
        assertEq(crowdFunding.getDonorCount(campaignCount), 1);
        vm.stopPrank();

        // verify that second donation by different donor increases the donor count
        vm.startPrank(ALICE);
        vm.deal(ALICE, 100 ether);
        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        assertEq(crowdFunding.getDonorCount(campaignCount), 2);
        vm.stopPrank();
    }

    function test_withdrawDonation() public {
        // 1. USER creates a published campaign
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(
            getTestCampaignInputFlexibleWithdrawal()
        );
        vm.stopPrank();

        // 2. ALICE donates to the campaign
        vm.startPrank(ALICE);
        vm.deal(ALICE, 100 ether); // Fund ALICE
        crowdFunding.donateToCampaign{value: SEND_VALUE}(campaignCount);
        vm.stopPrank();

        // 3. Check balances before withdrawal
        uint256 balanceBefore = USER.balance;

        // 4. USER withdraws the funds
        vm.startPrank(USER);
        crowdFunding.withdrawCampaignFunds(campaignCount);
        vm.stopPrank();

        // 5. Check balance after withdrawal
        uint256 balanceAfter = USER.balance;

        // 6. Assert that the USER received the donation amount
        assertEq(balanceAfter, balanceBefore + SEND_VALUE);

        // 7. Optional: check that amountCollected is reset to 0 or left untouched based on your implementation
        CrowdFunding.Campaign memory campaign = crowdFunding.getCampaign(
            campaignCount,
            true
        );
        assertEq(campaign.amountCollected, SEND_VALUE); // or 0 if reset in withdrawDonations
    }
}
