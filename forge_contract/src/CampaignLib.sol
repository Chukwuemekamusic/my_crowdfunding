// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title CampaignLib
 * @dev Library for campaign-related data structures and validation
 */
library CampaignLib {
    // Custom Errors defined within the library
    error CampaignLib_InvalidCategory();
    error CampaignLib_InvalidDeadline();
    error CampaignLib_InvalidTarget();
    error CampaignLib_InsufficientBalance(); // For canWithdraw
    error CampaignLib_CampaignActive(); // For canWithdraw

    enum Category {
        Technology,
        Art,
        Community,
        Business,
        Charity,
        Other
    }

    enum CampaignStatus {
        Draft,
        Published,
        Cancelled
    }

    struct Donor {
        uint128 amount;
        uint64 timestamp;
        bool hasDonated;
        uint16 noOfDonations;
    }

    struct Campaign {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        uint256 withdrawnAmount;
        string image;
        Category category;
        CampaignStatus status;
        uint256 donorCount;
        bool allowFlexibleWithdrawal;
    }

    struct CampaignInput {
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        string image;
        Category category;
        bool allowFlexibleWithdrawal;
    }

    struct CampaignUpdateInput {
        uint256 id;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        string image;
        Category category;
    }

    // Library functions for validation
    function validateCategory(Category category) internal pure {
        if (uint8(category) > uint8(Category.Other))
            revert CampaignLib_InvalidCategory(); // Revert directly
    }

    function validateDeadline(uint256 deadline) internal view {
        if (deadline <= block.timestamp) revert CampaignLib_InvalidDeadline(); // Revert directly
    }

    function validateTarget(uint256 target) internal pure {
        if (target == 0) revert CampaignLib_InvalidTarget(); // Revert directly
    }

    function initializeCampaign(
        Campaign storage campaign,
        uint256 id,
        address creator,
        CampaignInput calldata input,
        CampaignStatus status
    ) internal {
        campaign.id = id;
        campaign.owner = creator;
        campaign.title = input.title;
        campaign.description = input.description;
        campaign.target = input.target;
        campaign.deadline = input.deadline;
        campaign.amountCollected = 0;
        campaign.withdrawnAmount = 0;
        campaign.image = input.image;
        campaign.category = input.category;
        campaign.status = status;
        campaign.donorCount = 0;
        campaign.allowFlexibleWithdrawal = input.allowFlexibleWithdrawal;
    }

    function updateCampaign(
        Campaign storage campaign,
        CampaignUpdateInput calldata input
    ) internal {
        campaign.title = input.title;
        campaign.description = input.description;
        campaign.target = input.target;
        campaign.deadline = input.deadline;
        campaign.image = input.image;
        campaign.category = input.category;
    }

    function canWithdraw(Campaign storage campaign) internal view {
        if (campaign.amountCollected <= campaign.withdrawnAmount)
            revert CampaignLib_InsufficientBalance();
        if (
            !campaign.allowFlexibleWithdrawal &&
            block.timestamp <= campaign.deadline
        ) revert CampaignLib_CampaignActive();
    }
}
