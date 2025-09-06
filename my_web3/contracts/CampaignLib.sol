// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title CampaignLib
 * @author Joseph Anyaegbunam
 * @notice Library for campaign-related data structures, validation, and utility functions
 * @dev Provides reusable components for crowdfunding campaign management
 */
library CampaignLib {
    // ============================================================================
    // CUSTOM ERRORS
    // ============================================================================

    error CampaignLib_InvalidCategory();
    error CampaignLib_InvalidDeadline();
    error CampaignLib_InvalidTarget();
    error CampaignLib_InsufficientBalance();
    error CampaignLib_CampaignActive();

    // ============================================================================
    // ENUMS
    // ============================================================================

    /// @notice Available categories for campaigns
    /// @dev Used to classify campaigns for filtering and organization
    enum Category {
        Technology, // Tech-related projects and innovations
        Art, // Creative and artistic projects
        Community, // Community-driven initiatives
        Business, // Business and entrepreneurial ventures
        Charity, // Charitable causes and non-profit projects
        Other // Miscellaneous projects not fitting other categories

    }

    /// @notice Possible states of a campaign lifecycle
    /// @dev Controls campaign visibility and interaction permissions
    enum CampaignStatus {
        Draft, // Campaign is being created/edited, not visible to public
        Published, // Campaign is live and accepting donations
        Cancelled // Campaign has been cancelled by owner

    }

    // ============================================================================
    // STRUCTS
    // ============================================================================

    /// @notice Information about a donor's contributions to a specific campaign
    /// @dev Optimized for gas efficiency with packed storage
    struct Donor {
        uint128 amount; // Total amount donated (supports up to ~3.4 * 10^38 wei)
        uint64 timestamp; // Timestamp of last donation
        bool hasDonated; // Flag indicating if this address has ever donated
        uint16 noOfDonations; // Number of separate donation transactions
    }

    /// @notice Complete campaign information structure
    /// @dev Main data structure containing all campaign details and state
    struct Campaign {
        uint256 id; // Unique campaign identifier
        address owner; // Address of campaign creator
        string title; // Campaign title/name
        string description; // Detailed campaign description
        uint256 target; // Fundraising goal in wei
        uint256 deadline; // Campaign end timestamp
        uint256 amountCollected; // Total amount raised so far
        uint256 withdrawnAmount; // Amount already withdrawn by owner
        string image; // IPFS hash or URL for campaign image
        Category category; // Campaign category for classification
        CampaignStatus status; // Current campaign status
        uint256 donorCount; // Number of unique donors
        bool allowFlexibleWithdrawal; // Whether owner can withdraw before deadline
    }

    /// @notice Input structure for creating new campaigns
    /// @dev Used to pass campaign creation parameters efficiently
    struct CampaignInput {
        string title; // Campaign title/name
        string description; // Detailed campaign description
        uint256 target; // Fundraising goal in wei
        uint256 deadline; // Campaign end timestamp
        string image; // IPFS hash or URL for campaign image
        Category category; // Campaign category for classification
        bool allowFlexibleWithdrawal; // Whether owner can withdraw before deadline
    }

    /// @notice Input structure for updating existing campaigns
    /// @dev Used to pass campaign update parameters, excludes non-updatable fields
    struct CampaignUpdateInput {
        uint256 id; // Campaign ID to update
        string title; // Updated campaign title/name
        string description; // Updated campaign description
        uint256 target; // Updated fundraising goal in wei
        uint256 deadline; // Updated campaign end timestamp
        string image; // Updated IPFS hash or URL for campaign image
        Category category; // Updated campaign category
    }

    /**
     * @notice Pagination parameters for campaign queries
     * @param offset Number of items to skip
     * @param limit Maximum number of items to return
     */
    struct PaginationParams {
        uint256 offset;
        uint256 limit;
    }

    // ============================================================================
    // VALIDATION FUNCTIONS
    // ============================================================================

    /**
     * @notice Validates that a category is within the valid enum range
     * @param category The category to validate
     * @dev Reverts with CampaignLib_InvalidCategory if category is invalid
     * @dev Uses uint8 casting to check against enum bounds
     */
    function validateCategory(Category category) internal pure {
        if (uint8(category) > uint8(Category.Other)) {
            revert CampaignLib_InvalidCategory();
        }
    }

    /**
     * @notice Validates that a deadline is in the future
     * @param deadline The deadline timestamp to validate
     * @dev Reverts with CampaignLib_InvalidDeadline if deadline is not in the future
     * @dev Compares against block.timestamp for current time
     */
    function validateDeadline(uint256 deadline) internal view {
        if (deadline <= block.timestamp) revert CampaignLib_InvalidDeadline();
    }

    /**
     * @notice Validates that a target amount is greater than zero
     * @param target The target amount to validate in wei
     * @dev Reverts with CampaignLib_InvalidTarget if target is zero
     */
    function validateTarget(uint256 target) internal pure {
        if (target == 0) revert CampaignLib_InvalidTarget();
    }

    /**
     * @notice Validates all campaign input parameters in a single function call
     * @param input The campaign input data to validate
     * @dev Consolidates target, deadline, and category validation for gas efficiency
     * @dev Reverts with appropriate error if any validation fails
     */
    function validateCampaignInput(CampaignInput calldata input) internal view {
        validateTarget(input.target);
        validateDeadline(input.deadline);
        validateCategory(input.category);
    }

    /**
     * @notice Validates all campaign update input parameters in a single function call
     * @param input The campaign update input data to validate
     * @dev Consolidates target, deadline, and category validation for gas efficiency
     * @dev Reverts with appropriate error if any validation fails
     */
    function validateCampaignUpdateInput(CampaignUpdateInput calldata input) internal view {
        validateTarget(input.target);
        validateDeadline(input.deadline);
        validateCategory(input.category);
    }

    // ============================================================================
    // CAMPAIGN MANAGEMENT FUNCTIONS
    // ============================================================================

    /**
     * @notice Initializes a new campaign with provided input data
     * @param campaign Storage reference to the campaign struct to initialize
     * @param id Unique identifier for the campaign
     * @param creator Address of the campaign creator/owner
     * @param input Campaign input data containing all campaign details
     * @param status Initial status for the campaign (Draft or Published)
     * @dev Sets all campaign fields from input data and initializes counters to zero
     * @dev Called during campaign creation to populate the campaign struct
     */
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

    /**
     * @notice Updates an existing campaign with new information
     * @param campaign Storage reference to the campaign struct to update
     * @param input Campaign update data containing new values
     * @dev Updates only the modifiable fields of a campaign
     * @dev Does not update id, owner, status, amounts, or donor count
     * @dev Should only be called on campaigns in Draft status
     */
    function updateCampaign(Campaign storage campaign, CampaignUpdateInput calldata input) internal {
        campaign.title = input.title;
        campaign.description = input.description;
        campaign.target = input.target;
        campaign.deadline = input.deadline;
        campaign.image = input.image;
        campaign.category = input.category;
    }

    /**
     * @notice Checks if funds can be withdrawn from a campaign
     * @param campaign Storage reference to the campaign to check
     * @dev Validates withdrawal conditions based on campaign settings
     * @dev For non-flexible campaigns: must be past deadline
     * @dev For all campaigns: must have sufficient balance (collected > withdrawn)
     * @dev Reverts with appropriate error if withdrawal conditions are not met
     */
    function canWithdraw(Campaign storage campaign) internal view {
        if (campaign.amountCollected <= campaign.withdrawnAmount) {
            revert CampaignLib_InsufficientBalance();
        }
        if (!campaign.allowFlexibleWithdrawal && block.timestamp <= campaign.deadline) {
            revert CampaignLib_CampaignActive();
        }
    }
}