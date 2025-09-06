// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {CrowdFunding} from "../src/CrowdFunding.sol";
import {CampaignLib} from "../src/CampaignLib.sol";
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
// ✓ test getCampaigns
// ✓ test cancelDraftCampaign
// ✓ test updateDraftCampaign

contract CrowdFundingTest is Test {
    CrowdFunding public crowdFunding;
    address USER = makeAddr("user");
    address ALICE = makeAddr("alice");
    uint256 constant STARTING_USER_BALANCE = 10 ether;
    uint256 constant SEND_VALUE = 0.1 ether;
    DeployCrowdFundingWithCampaigns deployCrowdFunding;

    function getTestCampaignInput() internal view returns (CampaignLib.CampaignInput memory) {
        return CampaignLib.CampaignInput({
            title: "Test Campaign",
            description: "This is a test campaign",
            target: 100,
            deadline: block.timestamp + 1000,
            image: "https://example.com/image.png",
            category: CampaignLib.Category.Technology,
            allowFlexibleWithdrawal: false
        });
    }

    function getTestCampaignInputFlexibleWithdrawal() internal view returns (CampaignLib.CampaignInput memory) {
        return CampaignLib.CampaignInput({
            title: "Test Campaign Flexible",
            description: "This is a test campaign with flexible withdrawal",
            target: 100,
            deadline: block.timestamp + 1000,
            image: "https://example.com/image.png",
            category: CampaignLib.Category.Technology,
            allowFlexibleWithdrawal: true
        });
    }

    function getTestCampaignUpdateInput(uint256 campaignId)
        internal
        view
        returns (CampaignLib.CampaignUpdateInput memory)
    {
        return CampaignLib.CampaignUpdateInput({
            id: campaignId,
            title: "Updated Test Campaign",
            description: "This is an updated test campaign",
            target: 200,
            deadline: block.timestamp + 2000,
            image: "https://example.com/updated-image.png",
            category: CampaignLib.Category.Art
        });
    }

    function setUp() public {
        deployCrowdFunding = new DeployCrowdFundingWithCampaigns();
        crowdFunding = deployCrowdFunding.run();
        console.log("\n\n");
        console.log("vm signer:", vm.addr(1));
        console.log("deployCrowdFunding address:", address(deployCrowdFunding));
        console.log("crowdFunding address:", address(crowdFunding));
        // console.log("crowdFunding owner:", address(crowdFunding.getOwner()));
        console.log("test contract address:", address(this));
        vm.deal(USER, STARTING_USER_BALANCE);
    }

    function test_CrowdFunding_Deployment() public view {
        assertTrue(address(crowdFunding) != address(0));
    }

    function test_createDraft() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        // verify that the campaign is created
        assertEq(crowdFunding.campaignCount(), campaignCount + 1);

        // verify that the campaign is in draft status
        assertEq(uint8(crowdFunding.getCampaignStatus(campaignCount)), uint8(CampaignLib.CampaignStatus.Draft));

        CampaignLib.Campaign memory campaign = crowdFunding.getCampaign(campaignCount, false);
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

        // verify that the campaign is in published status
        assertEq(uint8(crowdFunding.getCampaignStatus(campaignCount)), uint8(CampaignLib.CampaignStatus.Published));

        CampaignLib.Campaign memory campaign = crowdFunding.getCampaign(campaignCount, true);
        assertEq(campaign.owner, USER);
        assertEq(campaign.title, "Test Campaign");
        assertEq(campaign.target, 100);
        vm.stopPrank();
    }

    function test_getCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        CampaignLib.Campaign memory campaign = crowdFunding.getCampaign(campaignCount, false);
        assertEq(campaign.owner, USER);
        assertEq(campaign.title, "Test Campaign");

        // verify that it doesn't return a published campaign when filtering for published only
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
        assertEq(uint8(crowdFunding.getCampaignStatus(campaignCount)), uint8(CampaignLib.CampaignStatus.Published));

        vm.stopPrank();
    }

    function test_updateDraftCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        // Update the draft campaign
        crowdFunding.updateDraftCampaign(getTestCampaignUpdateInput(campaignCount));

        CampaignLib.Campaign memory updatedCampaign = crowdFunding.getCampaign(campaignCount, false);

        // Verify the updates
        assertEq(updatedCampaign.title, "Updated Test Campaign");
        assertEq(updatedCampaign.description, "This is an updated test campaign");
        assertEq(updatedCampaign.target, 200);
        assertEq(uint8(updatedCampaign.category), uint8(CampaignLib.Category.Art));

        vm.stopPrank();
    }

    function test_cancelDraftCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createDraft(getTestCampaignInput());

        // Cancel the draft campaign
        crowdFunding.cancelDraftCampaign(campaignCount);

        // Verify that the campaign is cancelled
        assertEq(uint8(crowdFunding.getCampaignStatus(campaignCount)), uint8(CampaignLib.CampaignStatus.Cancelled));

        vm.stopPrank();
    }

    function test_donateToCampaign() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        crowdFunding.donateToCampaign{value: 10}(campaignCount);

        CampaignLib.Campaign memory campaign = crowdFunding.getCampaign(campaignCount, true);

        // verify that the campaign has received the donation
        assertEq(campaign.amountCollected, 10);

        // verify that the donor count is correct
        assertEq(campaign.donorCount, 1);

        vm.stopPrank();
    }

    function test_getDonorInfo() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        (uint256 amount, uint256 timestamp, uint16 noOfDonations) = crowdFunding.getDonorInfo(campaignCount, USER);
        assertEq(amount, 10);
        assertEq(timestamp, block.timestamp);
        assertEq(noOfDonations, 1);
        vm.stopPrank();
    }

    function test_getDonorInfo_MoreThanOneDonation() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        crowdFunding.donateToCampaign{value: 20}(campaignCount);
        (uint256 amount, uint256 timestamp, uint16 noOfDonations) = crowdFunding.getDonorInfo(campaignCount, USER);
        assertEq(amount, 30);
        assertEq(timestamp, block.timestamp);
        assertEq(noOfDonations, 2);
        vm.stopPrank();
    }

    function test_DonorCount() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInput());
        assertEq(crowdFunding.getDonorCount(campaignCount), 0);
        crowdFunding.donateToCampaign{value: 10}(campaignCount);
        assertEq(crowdFunding.getDonorCount(campaignCount), 1);

        // verify that second donation by same donor does not increase the donor count
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
        // 1. USER creates a published campaign with flexible withdrawal
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();
        crowdFunding.createPublishedCampaign(getTestCampaignInputFlexibleWithdrawal());
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

        // 7. Check that the campaign state is updated correctly
        CampaignLib.Campaign memory campaign = crowdFunding.getCampaign(campaignCount, true);
        assertEq(campaign.amountCollected, SEND_VALUE);
        assertEq(campaign.withdrawnAmount, SEND_VALUE);
        assertEq(crowdFunding.getRemainingBalance(campaignCount), 0);
    }

    function test_getCampaigns() public {
        vm.startPrank(USER);
        uint256 campaignCount = crowdFunding.campaignCount();

        // Create multiple campaigns
        crowdFunding.createDraft(getTestCampaignInput());
        crowdFunding.createPublishedCampaign(getTestCampaignInput());

        // Get all campaigns
        CampaignLib.Campaign[] memory allCampaigns = crowdFunding.getCampaigns();
        assertEq(allCampaigns.length, campaignCount + 2);

        // Verify campaign details
        // assertEq(allCampaigns[0].owner, USER);
        // assertEq(allCampaigns[1].owner, USER);
        // assertEq(uint8(allCampaigns[0].status), uint8(CampaignLib.CampaignStatus.Draft));
        // assertEq(uint8(allCampaigns[1].status), uint8(CampaignLib.CampaignStatus.Published));

        vm.stopPrank();
    }

    function test_getPublishedCampaigns() public {
        vm.startPrank(USER);
        uint256 currentPublishedCampaigns = crowdFunding.getPublishedCampaignsUnpaginated().length;

        // Create mix of draft and published campaigns
        crowdFunding.createDraft(getTestCampaignInput());
        crowdFunding.createPublishedCampaign(getTestCampaignInput());
        crowdFunding.createPublishedCampaign(getTestCampaignInputFlexibleWithdrawal());

        // Get only published campaigns
        CampaignLib.Campaign[] memory publishedCampaigns = crowdFunding.getPublishedCampaignsUnpaginated();
        assertEq(publishedCampaigns.length, currentPublishedCampaigns + 2);

        // All returned campaigns should be published
        for (uint256 i = 0; i < publishedCampaigns.length; i++) {
            assertEq(uint8(publishedCampaigns[i].status), uint8(CampaignLib.CampaignStatus.Published));
        }

        vm.stopPrank();
    }

    function test_getUserCampaigns() public {
        vm.startPrank(USER);
        crowdFunding.createDraft(getTestCampaignInput());
        crowdFunding.createPublishedCampaign(getTestCampaignInput());
        vm.stopPrank();

        vm.startPrank(ALICE);
        crowdFunding.createDraft(getTestCampaignInput());
        vm.stopPrank();

        // Get USER's campaigns
        CampaignLib.Campaign[] memory userCampaigns = crowdFunding.getUserCampaigns(USER);
        assertEq(userCampaigns.length, 2);

        for (uint256 i = 0; i < userCampaigns.length; i++) {
            assertEq(userCampaigns[i].owner, USER);
        }

        // Get ALICE's campaigns
        CampaignLib.Campaign[] memory aliceCampaigns = crowdFunding.getUserCampaigns(ALICE);
        assertEq(aliceCampaigns.length, 1);
        assertEq(aliceCampaigns[0].owner, ALICE);
    }

    function test_getCampaignsByCategory() public {
        vm.startPrank(USER);

        // Create campaigns with different categories
        CampaignLib.CampaignInput memory techInput = getTestCampaignInput();
        techInput.category = CampaignLib.Category.Technology;
        crowdFunding.createPublishedCampaign(techInput);

        CampaignLib.CampaignInput memory artInput = getTestCampaignInput();
        artInput.category = CampaignLib.Category.Art;
        crowdFunding.createPublishedCampaign(artInput);

        CampaignLib.CampaignInput memory techInput2 = getTestCampaignInput();
        techInput2.category = CampaignLib.Category.Technology;
        crowdFunding.createPublishedCampaign(techInput2);

        vm.stopPrank();

        // Get campaigns by Technology category
        CampaignLib.Campaign[] memory techCampaigns =
            crowdFunding.getCampaignsByCategory(CampaignLib.Category.Technology);
        assertEq(techCampaigns.length, 2);

        for (uint256 i = 0; i < techCampaigns.length; i++) {
            assertEq(uint8(techCampaigns[i].category), uint8(CampaignLib.Category.Technology));
            assertEq(uint8(techCampaigns[i].status), uint8(CampaignLib.CampaignStatus.Published));
        }

        // Get campaigns by Art category
        CampaignLib.Campaign[] memory artCampaigns = crowdFunding.getCampaignsByCategory(CampaignLib.Category.Art);
        assertEq(artCampaigns.length, 1);
        assertEq(uint8(artCampaigns[0].category), uint8(CampaignLib.Category.Art));
    }

    // Test error cases
    function test_createDraft_InvalidTarget() public {
        vm.startPrank(USER);
        CampaignLib.CampaignInput memory input = getTestCampaignInput();
        input.target = 0; // Invalid target

        vm.expectRevert(CampaignLib.CampaignLib_InvalidTarget.selector);
        crowdFunding.createDraft(input);
        vm.stopPrank();
    }

    function test_createDraft_InvalidDeadline() public {
        vm.startPrank(USER);
        CampaignLib.CampaignInput memory input = getTestCampaignInput();
        input.deadline = block.timestamp - 1; // Past deadline

        vm.expectRevert(CampaignLib.CampaignLib_InvalidDeadline.selector);
        crowdFunding.createDraft(input);
        vm.stopPrank();
    }

    function test_donateToCampaign_ZeroDonation() public {
        vm.startPrank(USER);
        uint256 campaignId = crowdFunding.createPublishedCampaign(getTestCampaignInput());

        vm.expectRevert(CrowdFunding.ZeroDonation.selector);
        crowdFunding.donateToCampaign{value: 0}(campaignId);
        vm.stopPrank();
    }

    function test_withdrawCampaignFunds_CampaignActive() public {
        vm.startPrank(USER);
        // Create campaign without flexible withdrawal
        uint256 campaignId = crowdFunding.createPublishedCampaign(getTestCampaignInput());
        vm.stopPrank();

        vm.startPrank(ALICE);
        vm.deal(ALICE, 1 ether);
        crowdFunding.donateToCampaign{value: 0.1 ether}(campaignId);
        vm.stopPrank();

        vm.startPrank(USER);
        vm.expectRevert(CampaignLib.CampaignLib_CampaignActive.selector);
        crowdFunding.withdrawCampaignFunds(campaignId);
        vm.stopPrank();
    }

    function testGetActiveCampaigns() public {
        // Deploy fresh contract for isolated test
        CrowdFunding freshContract = new CrowdFunding();
        vm.startPrank(USER);

        // Create two campaigns with different deadlines
        CampaignLib.CampaignInput memory activeInput = CampaignLib.CampaignInput({
            title: "Active Campaign",
            description: "This is an active campaign",
            target: 1 ether,
            deadline: block.timestamp + 30 days,
            image: "active-image-hash",
            category: CampaignLib.Category.Technology,
            allowFlexibleWithdrawal: false
        });

        CampaignLib.CampaignInput memory soonToExpireInput = CampaignLib.CampaignInput({
            title: "Soon to Expire Campaign",
            description: "This campaign will expire soon",
            target: 2 ether,
            deadline: block.timestamp + 5 days,
            image: "expire-image-hash",
            category: CampaignLib.Category.Art,
            allowFlexibleWithdrawal: false
        });

        // Create and publish both campaigns
        uint256 activeCampaignId = freshContract.createPublishedCampaign(activeInput);
        uint256 soonToExpireId = freshContract.createPublishedCampaign(soonToExpireInput);

        // Test getActiveCampaigns - both should be active
        CampaignLib.PaginationParams memory params = CampaignLib.PaginationParams({offset: 0, limit: 10});

        (CampaignLib.Campaign[] memory activeCampaigns, uint256 totalActive) = freshContract.getActiveCampaigns(params);
        (CampaignLib.Campaign[] memory completedCampaigns, uint256 totalCompleted) =
            freshContract.getCompletedCampaigns(params);

        // Should return both active campaigns
        assertEq(totalActive, 2);
        assertEq(activeCampaigns.length, 2);
        assertEq(totalCompleted, 0);
        assertEq(completedCampaigns.length, 0);

        // Warp time to make one campaign expire
        vm.warp(block.timestamp + 10 days);

        (CampaignLib.Campaign[] memory activeCampaignsAfter, uint256 totalActiveAfter) =
            freshContract.getActiveCampaigns(params);
        (CampaignLib.Campaign[] memory completedCampaignsAfter, uint256 totalCompletedAfter) =
            freshContract.getCompletedCampaigns(params);

        // Should have one less active campaign now
        assertEq(totalActiveAfter, totalActive - totalCompletedAfter);
        assertEq(activeCampaignId, activeCampaignsAfter[0].id);
        assertEq(soonToExpireId, completedCampaignsAfter[0].id);

        vm.stopPrank();
    }

    function testGetCompletedCampaigns() public {
        // Deploy fresh contract for isolated test
        CrowdFunding freshContract = new CrowdFunding();
        vm.startPrank(USER);

        // Create a campaign that will expire soon
        CampaignLib.CampaignInput memory shortTermInput = CampaignLib.CampaignInput({
            title: "Short Term Campaign",
            description: "This campaign will expire soon",
            target: 1 ether,
            deadline: block.timestamp + 5 days,
            image: "short-image-hash",
            category: CampaignLib.Category.Technology,
            allowFlexibleWithdrawal: false
        });

        // Create and publish campaign
        uint256 shortTermId = freshContract.createPublishedCampaign(shortTermInput);

        // Test getCompletedCampaigns - should be empty initially
        CampaignLib.PaginationParams memory params = CampaignLib.PaginationParams({offset: 0, limit: 10});

        (CampaignLib.Campaign[] memory completedCampaignsBefore, uint256 totalCompletedBefore) =
            freshContract.getCompletedCampaigns(params);

        assertEq(totalCompletedBefore, 0); // Should be 0 since campaign is still active

        // Warp time to make the campaign expire
        vm.warp(block.timestamp + 10 days);

        (CampaignLib.Campaign[] memory completedCampaignsAfter, uint256 totalCompletedAfter) =
            freshContract.getCompletedCampaigns(params);

        // Should have one completed campaign now
        assertEq(totalCompletedAfter, 1);

        // Find our campaign in the completed list
        bool foundOurCampaign = false;
        for (uint256 i = 0; i < completedCampaignsAfter.length; i++) {
            if (completedCampaignsAfter[i].id == shortTermId) {
                foundOurCampaign = true;
                assertEq(completedCampaignsAfter[i].title, "Short Term Campaign");
                break;
            }
        }
        assertTrue(foundOurCampaign, "Our campaign should be in completed list");

        vm.stopPrank();
    }

    function testActiveCampaignsPagination() public {
        vm.startPrank(USER);

        // Get current active campaigns count
        CampaignLib.PaginationParams memory countParams = CampaignLib.PaginationParams({offset: 0, limit: 1000});
        (, uint256 initialActiveCount) = crowdFunding.getActiveCampaigns(countParams);

        // Create multiple active campaigns
        for (uint256 i = 0; i < 5; i++) {
            CampaignLib.CampaignInput memory input = CampaignLib.CampaignInput({
                title: string(abi.encodePacked("Active Campaign ", vm.toString(i))),
                description: "Active campaign description",
                target: 1 ether,
                deadline: block.timestamp + 30 days,
                image: "image-hash",
                category: CampaignLib.Category.Technology,
                allowFlexibleWithdrawal: false
            });
            crowdFunding.createPublishedCampaign(input);
        }

        uint256 expectedTotal = initialActiveCount + 5;

        // Test pagination - first page (limit 2)
        CampaignLib.PaginationParams memory params1 = CampaignLib.PaginationParams({offset: 0, limit: 2});

        (CampaignLib.Campaign[] memory page1, uint256 total1) = crowdFunding.getActiveCampaigns(params1);
        assertEq(total1, expectedTotal); // Total should include existing + new campaigns
        assertEq(page1.length, 2); // Should return 2 campaigns

        // Test pagination - second page (offset 2, limit 2)
        CampaignLib.PaginationParams memory params2 = CampaignLib.PaginationParams({offset: 2, limit: 2});

        (CampaignLib.Campaign[] memory page2, uint256 total2) = crowdFunding.getActiveCampaigns(params2);
        assertEq(total2, expectedTotal); // Total should still be same
        assertEq(page2.length, 2); // Should return 2 campaigns

        // Test pagination - get campaigns from our newly created ones
        CampaignLib.PaginationParams memory params3 = CampaignLib.PaginationParams({
            offset: initialActiveCount, // Skip existing campaigns
            limit: 5 // Get our 5 new campaigns
        });

        (CampaignLib.Campaign[] memory page3, uint256 total3) = crowdFunding.getActiveCampaigns(params3);
        assertEq(total3, expectedTotal); // Total should still be same
        assertEq(page3.length, 5); // Should return our 5 new campaigns

        vm.stopPrank();
    }
}
