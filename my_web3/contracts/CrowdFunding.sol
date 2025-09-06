// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import {CampaignLib} from "./CampaignLib.sol";

/**
 * @title CrowdFunding Contract
 * @dev Decentralized crowdfunding platform with draft/published campaign workflow
 * @author Joseph Anyaegbunam
 */
contract CrowdFunding is Ownable {
    using CampaignLib for *;

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Mapping of campaign ID to donor address to donor information
    /// @dev Tracks all donations made by each address to each campaign
    mapping(uint256 => mapping(address => CampaignLib.Donor)) public campaignDonors;

    /// @notice Mapping of campaign ID to campaign data
    /// @dev Stores all campaign information using the CampaignLib.Campaign struct
    mapping(uint256 => CampaignLib.Campaign) public campaigns;

    /// @notice Total number of campaigns created
    /// @dev Used as the next campaign ID and for iteration bounds
    uint256 public campaignCount = 0;

    /*//////////////////////////////////////////////////////////////
                             CUSTOM ERRORS
    //////////////////////////////////////////////////////////////*/
    error ZeroDonation();
    error CampaignNotPublished();
    error CampaignEnded();
    error NotDraftStatus();
    error NotCampaignOwner();
    error CampaignNotFound();
    error WithdrawalFailed();
    error NoDonationsMade();
    error ImageRequired();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event CampaignCreated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 target,
        uint256 deadline,
        CampaignLib.Category indexed category
    );
    event CampaignUpdated(uint256 indexed id);
    event CampaignPublished(uint256 indexed id, address indexed owner);
    event CampaignCancelled(uint256 indexed id, address indexed owner);
    event CampaignDonated(uint256 indexed id, address indexed donator, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Ensures the campaign is in draft status
    /// @param _id The campaign ID to check
    /// @dev Reverts with NotDraftStatus if campaign is not in draft status
    modifier onlyDraft(uint256 _id) {
        if (campaigns[_id].status != CampaignLib.CampaignStatus.Draft) {
            revert NotDraftStatus();
        }
        _;
    }

    /// @notice Ensures the caller is the campaign owner
    /// @param _id The campaign ID to check ownership for
    /// @dev Reverts with NotCampaignOwner if caller is not the campaign owner
    modifier onlyCampaignOwner(uint256 _id) {
        if (msg.sender != campaigns[_id].owner) revert NotCampaignOwner();
        _;
    }

    /// @notice Validates that the campaign exists
    /// @param _id The campaign ID to validate
    /// @dev Reverts with CampaignNotFound if campaign ID is invalid
    modifier validateCampaign(uint256 _id) {
        if (_id >= campaignCount) revert CampaignNotFound();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initializes the CrowdFunding contract
    /// @dev Sets the deployer as the contract owner using OpenZeppelin's Ownable
    constructor() Ownable(msg.sender) {}

    // ============================================================================
    // CAMPAIGN CREATION FUNCTIONS
    // ============================================================================

    /**
     * @notice Creates a new campaign in draft status that can be edited before publishing
     * @param input The campaign input data containing title, description, target, deadline, image, category, and withdrawal settings
     * @return The ID of the newly created campaign
     * @dev Validates input parameters using CampaignLib functions and initializes campaign in Draft status
     * @dev Emits CampaignCreated event upon successful creation
     */
    function createDraft(CampaignLib.CampaignInput calldata input) public returns (uint256) {
        CampaignLib.validateCampaignInput(input);

        uint256 newCampaignId = campaignCount;
        CampaignLib.Campaign storage newCampaign = campaigns[campaignCount];

        CampaignLib.initializeCampaign(newCampaign, newCampaignId, msg.sender, input, CampaignLib.CampaignStatus.Draft);

        campaignCount++;

        emit CampaignCreated(newCampaignId, msg.sender, input.title, input.target, input.deadline, input.category);

        return newCampaignId;
    }

    /**
     * @notice Creates a new campaign and immediately publishes it for donations
     * @param input The campaign input data containing title, description, target, deadline, image, category, and withdrawal settings
     * @return The ID of the newly created and published campaign
     * @dev Validates input parameters and requires an image to be provided
     * @dev Initializes campaign in Published status, making it immediately available for donations
     * @dev Emits CampaignCreated event upon successful creation
     */
    function createPublishedCampaign(CampaignLib.CampaignInput calldata input) public returns (uint256) {
        CampaignLib.validateCampaignInput(input);
        if (bytes(input.image).length == 0) revert ImageRequired();

        uint256 newCampaignId = campaignCount;
        CampaignLib.Campaign storage newCampaign = campaigns[campaignCount];

        CampaignLib.initializeCampaign(
            newCampaign, newCampaignId, msg.sender, input, CampaignLib.CampaignStatus.Published
        );

        campaignCount++;

        emit CampaignCreated(newCampaignId, msg.sender, input.title, input.target, input.deadline, input.category);

        return newCampaignId;
    }

    // ============================================================================
    // CAMPAIGN MANAGEMENT FUNCTIONS
    // ============================================================================

    /**
     * @notice Updates an existing draft campaign with new information
     * @param input The campaign update data containing id, title, description, target, deadline, image, and category
     * @dev Only the campaign owner can update their campaign
     * @dev Campaign must be in draft status to be updated
     * @dev Validates all input parameters using CampaignLib functions
     * @dev Emits CampaignUpdated event upon successful update
     */
    function updateDraftCampaign(CampaignLib.CampaignUpdateInput calldata input)
        public
        onlyCampaignOwner(input.id)
        onlyDraft(input.id)
    {
        CampaignLib.validateCampaignUpdateInput(input);

        CampaignLib.Campaign storage campaign = campaigns[input.id];
        CampaignLib.updateCampaign(campaign, input);

        emit CampaignUpdated(input.id);
    }

    /**
     * @notice Publishes a draft campaign, making it available for donations
     * @param _id The ID of the campaign to publish
     * @dev Only the campaign owner can publish their campaign
     * @dev Campaign must be in draft status and have an image
     * @dev Changes campaign status to Published
     * @dev Emits CampaignPublished event upon successful publication
     */
    function publishCampaign(uint256 _id) public onlyCampaignOwner(_id) onlyDraft(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];
        if (bytes(campaign.image).length == 0) revert ImageRequired();

        campaign.status = CampaignLib.CampaignStatus.Published;
        emit CampaignPublished(_id, msg.sender);
    }

    /**
     * @notice Cancels a draft campaign, preventing it from being published
     * @param _id The ID of the campaign to cancel
     * @dev Only the campaign owner can cancel their campaign
     * @dev Campaign must be in draft status to be cancelled
     * @dev Changes campaign status to Cancelled
     * @dev Emits CampaignCancelled event upon successful cancellation
     */
    function cancelDraftCampaign(uint256 _id) public onlyCampaignOwner(_id) onlyDraft(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];
        campaign.status = CampaignLib.CampaignStatus.Cancelled;
        emit CampaignCancelled(_id, msg.sender);
    }

    // ============================================================================
    // DONATION & WITHDRAWAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Allows users to donate ETH to a published campaign
     * @param _id The ID of the campaign to donate to
     * @dev Campaign must be published and not past its deadline
     * @dev Donation amount must be greater than zero
     * @dev Updates donor information and campaign collected amount
     * @dev Increments donor count for first-time donors
     * @dev Emits CampaignDonated event upon successful donation
     */
    function donateToCampaign(uint256 _id) public payable validateCampaign(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];

        if (msg.value == 0) revert ZeroDonation();
        if (campaign.status != CampaignLib.CampaignStatus.Published) {
            revert CampaignNotPublished();
        }
        if (campaign.deadline <= block.timestamp) revert CampaignEnded();

        CampaignLib.Donor storage donor = campaignDonors[_id][msg.sender];

        if (!donor.hasDonated) {
            campaign.donorCount++;
        }

        donor.amount += uint128(msg.value);
        donor.timestamp = uint64(block.timestamp);
        donor.hasDonated = true;
        donor.noOfDonations++;

        campaign.amountCollected += msg.value;

        emit CampaignDonated(_id, msg.sender, msg.value);
    }

    /**
     * @notice Allows campaign owner to withdraw collected funds
     * @param _id The ID of the campaign to withdraw funds from
     * @dev Only the campaign owner can withdraw funds
     * @dev Withdrawal conditions are checked by CampaignLib.canWithdraw()
     * @dev For campaigns without flexible withdrawal: must be past deadline
     * @dev Must have sufficient balance (collected > withdrawn)
     * @dev Updates withdrawn amount and transfers ETH to campaign owner
     * @dev Emits FundsWithdrawn event upon successful withdrawal
     */
    function withdrawCampaignFunds(uint256 _id) public validateCampaign(_id) onlyCampaignOwner(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];

        campaign.canWithdraw(); // Reverts if conditions aren't met

        uint256 amountToWithdraw = campaign.amountCollected - campaign.withdrawnAmount;
        campaign.withdrawnAmount += amountToWithdraw;

        (bool success,) = payable(campaign.owner).call{value: amountToWithdraw}("");
        if (!success) revert WithdrawalFailed();

        emit FundsWithdrawn(_id, campaign.owner, amountToWithdraw);
    }

    // ============================================================================
    // BASIC GETTER FUNCTIONS
    // ============================================================================

    /**
     * @notice Retrieves campaign information by ID with optional published-only filter
     * @param _id The ID of the campaign to retrieve
     * @param publishedOnly If true, only returns published campaigns
     * @return The campaign data structure
     * @dev Reverts with CampaignNotPublished if publishedOnly is true and campaign is not published
     */
    function getCampaign(uint256 _id, bool publishedOnly)
        public
        view
        validateCampaign(_id)
        returns (CampaignLib.Campaign memory)
    {
        CampaignLib.Campaign memory campaign = campaigns[_id];

        if (publishedOnly && campaign.status != CampaignLib.CampaignStatus.Published) {
            revert CampaignNotPublished();
        }

        return campaign;
    }

    /**
     * @notice Retrieves campaign information by ID without any filters
     * @param _id The ID of the campaign to retrieve
     * @return The campaign data structure
     * @dev Returns campaign regardless of status (draft, published, or cancelled)
     */
    function getCampaignById(uint256 _id) public view validateCampaign(_id) returns (CampaignLib.Campaign memory) {
        return campaigns[_id];
    }

    /**
     * @notice Retrieves all campaigns regardless of status
     * @return Array of all campaign data structures
     * @dev Returns campaigns in order of creation (by ID)
     * @dev Includes draft, published, and cancelled campaigns
     */
    function getCampaigns() public view returns (CampaignLib.Campaign[] memory) {
        CampaignLib.Campaign[] memory allCampaigns = new CampaignLib.Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    /**
     * @notice Gets the current status of a campaign
     * @param _id The ID of the campaign
     * @return The campaign status (Draft, Published, or Cancelled)
     */
    function getCampaignStatus(uint256 _id) public view returns (CampaignLib.CampaignStatus) {
        return campaigns[_id].status;
    }

    /**
     * @notice Gets the owner address of a campaign
     * @param _id The ID of the campaign
     * @return The address of the campaign owner
     */
    function getCampaignOwner(uint256 _id) public view returns (address) {
        return campaigns[_id].owner;
    }

    /**
     * @notice Calculates the remaining withdrawable balance for a campaign
     * @param _id The ID of the campaign
     * @return The amount available for withdrawal (collected - withdrawn)
     */
    function getRemainingBalance(uint256 _id) public view returns (uint256) {
        CampaignLib.Campaign storage campaign = campaigns[_id];
        return campaign.amountCollected - campaign.withdrawnAmount;
    }

    // ============================================================================
    // DONOR INFORMATION FUNCTIONS
    // ============================================================================

    /**
     * @notice Retrieves donation information for a specific donor and campaign
     * @param _id The ID of the campaign
     * @param _donor The address of the donor
     * @return amount The total amount donated by this donor
     * @return timestamp The timestamp of the donor's last donation
     * @return noOfDonations The number of separate donations made by this donor
     * @dev Reverts with NoDonationsMade if the donor has never donated to this campaign
     */
    function getDonorInfo(uint256 _id, address _donor)
        public
        view
        validateCampaign(_id)
        returns (uint256 amount, uint256 timestamp, uint16 noOfDonations)
    {
        CampaignLib.Donor memory donor = campaignDonors[_id][_donor];
        if (!donor.hasDonated) revert NoDonationsMade();
        return (donor.amount, donor.timestamp, donor.noOfDonations);
    }

    /**
     * @notice Gets the total number of unique donors for a campaign
     * @param _id The ID of the campaign
     * @return The number of unique addresses that have donated to this campaign
     */
    function getDonorCount(uint256 _id) public view returns (uint256) {
        return campaigns[_id].donorCount;
    }

    // ============================================================================
    // CAMPAIGN FILTERING FUNCTIONS
    // ============================================================================

    /// @notice Parameters for pagination in campaign queries
    /// @param offset The number of items to skip from the beginning
    /// @param limit The maximum number of items to return
    struct PaginationParams {
        uint256 offset;
        uint256 limit;
    }

    /**
     * @notice Retrieves published campaigns with pagination support
     * @param params Pagination parameters (offset and limit)
     * @return _campaigns Array of published campaigns within the specified range
     * @return total Total number of published campaigns available
     * @dev Only returns campaigns with Published status
     * @dev Useful for frontend pagination to avoid loading all campaigns at once
     */
    function getPublishedCampaigns(PaginationParams calldata params)
        public
        view
        returns (CampaignLib.Campaign[] memory _campaigns, uint256 total)
    {
        uint256 count = 0;
        total = 0;

        // First, count total published campaigns
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                total++;
            }
        }

        // Create array of appropriate size
        uint256 size = params.limit;
        if (params.offset + size > total) {
            size = total - params.offset;
        }
        _campaigns = new CampaignLib.Campaign[](size);

        // Fill array
        uint256 current = 0;
        for (uint256 i = 0; i < campaignCount && current < size; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                if (count >= params.offset) {
                    _campaigns[current] = campaigns[i];
                    current++;
                }
                count++;
            }
        }

        return (_campaigns, total);
    }

    /**
     * @notice Retrieves all published campaigns without pagination
     * @return Array of all published campaigns
     * @dev Alternative to getPublishedCampaigns for simpler use cases
     * @dev Only returns campaigns with Published status
     * @dev Consider using getPublishedCampaigns with pagination for large datasets
     */
    function getPublishedCampaignsUnpaginated() public view returns (CampaignLib.Campaign[] memory) {
        uint256 publishedCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                publishedCount++;
            }
        }

        CampaignLib.Campaign[] memory publishedCampaigns = new CampaignLib.Campaign[](publishedCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                publishedCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return publishedCampaigns;
    }

    /**
     * @notice Retrieves active published campaigns with pagination
     * @param params Pagination parameters (offset and limit)
     * @return activeCampaigns Array of active campaigns
     * @return total Total number of active campaigns
     * @dev Only returns campaigns that are published and have not reached their deadline
     * @dev Active means: status == Published AND deadline > block.timestamp
     */
    function getActiveCampaigns(CampaignLib.PaginationParams calldata params)
        public
        view
        returns (CampaignLib.Campaign[] memory activeCampaigns, uint256 total)
    {
        // First pass: count active campaigns
        uint256 activeCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published && campaigns[i].deadline > block.timestamp)
            {
                activeCount++;
            }
        }

        // Calculate how many campaigns to return
        uint256 remainingAfterOffset = activeCount > params.offset ? activeCount - params.offset : 0;
        uint256 campaignsToReturn = remainingAfterOffset > params.limit ? params.limit : remainingAfterOffset;

        // Create result array
        CampaignLib.Campaign[] memory resultCampaigns = new CampaignLib.Campaign[](campaignsToReturn);

        // Second pass: populate array with pagination
        uint256 index = 0;
        uint256 skipped = 0;

        for (uint256 i = 0; i < campaignCount && index < campaignsToReturn; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published && campaigns[i].deadline > block.timestamp)
            {
                if (skipped >= params.offset) {
                    resultCampaigns[index] = campaigns[i];
                    index++;
                } else {
                    skipped++;
                }
            }
        }

        return (resultCampaigns, activeCount);
    }

    /**
     * @notice Retrieves completed published campaigns with pagination
     * @param params Pagination parameters (offset and limit)
     * @return completedCampaigns Array of completed campaigns
     * @return total Total number of completed campaigns
     * @dev Only returns campaigns that are published and have reached their deadline
     * @dev Completed means: status == Published AND deadline <= block.timestamp
     */
    function getCompletedCampaigns(CampaignLib.PaginationParams calldata params)
        public
        view
        returns (CampaignLib.Campaign[] memory completedCampaigns, uint256 total)
    {
        // First pass: count completed campaigns
        uint256 completedCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published && campaigns[i].deadline <= block.timestamp)
            {
                completedCount++;
            }
        }

        // Calculate how many campaigns to return
        uint256 remainingAfterOffset = completedCount > params.offset ? completedCount - params.offset : 0;
        uint256 campaignsToReturn = remainingAfterOffset > params.limit ? params.limit : remainingAfterOffset;

        // Create result array
        CampaignLib.Campaign[] memory resultCampaigns = new CampaignLib.Campaign[](campaignsToReturn);

        // Second pass: populate array with pagination
        uint256 index = 0;
        uint256 skipped = 0;

        for (uint256 i = 0; i < campaignCount && index < campaignsToReturn; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published && campaigns[i].deadline <= block.timestamp)
            {
                if (skipped >= params.offset) {
                    resultCampaigns[index] = campaigns[i];
                    index++;
                } else {
                    skipped++;
                }
            }
        }

        return (resultCampaigns, completedCount);
    }

    /**
     * @notice Retrieves all published campaigns in a specific category
     * @param _category The category to filter campaigns by
     * @return Array of published campaigns in the specified category
     * @dev Only returns campaigns with Published status
     * @dev Categories include Technology, Art, Community, Business, Charity, Other
     */
    function getCampaignsByCategory(CampaignLib.Category _category)
        public
        view
        returns (CampaignLib.Campaign[] memory)
    {
        uint256 categoryCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].category == _category && campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                categoryCount++;
            }
        }

        CampaignLib.Campaign[] memory categoryCampaigns = new CampaignLib.Campaign[](categoryCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].category == _category && campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                categoryCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return categoryCampaigns;
    }

    // ============================================================================
    // USER-SPECIFIC CAMPAIGN FUNCTIONS
    // ============================================================================

    /**
     * @notice Retrieves all campaigns created by a specific user
     * @param _owner The address of the campaign owner
     * @return Array of campaigns owned by the specified address
     * @dev Returns campaigns regardless of status (draft, published, cancelled)
     * @dev Useful for user dashboard to show all their campaigns
     */
    function getUserCampaigns(address _owner) public view returns (CampaignLib.Campaign[] memory) {
        uint256 userCampaignCount = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                userCampaignCount++;
            }
        }

        CampaignLib.Campaign[] memory userCampaigns = new CampaignLib.Campaign[](userCampaignCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount && currentIndex < userCampaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                userCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return userCampaigns;
    }

    /**
     * @notice Retrieves all published campaigns created by a specific user
     * @param _owner The address of the campaign owner
     * @return Array of published campaigns owned by the specified address
     * @dev Only returns campaigns with Published status
     * @dev Useful for displaying a user's active fundraising campaigns
     */
    function getUserPublishedCampaigns(address _owner) public view returns (CampaignLib.Campaign[] memory) {
        uint256 publishedCount = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                publishedCount++;
            }
        }

        CampaignLib.Campaign[] memory publishedCampaigns = new CampaignLib.Campaign[](publishedCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount && currentIndex < publishedCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                publishedCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return publishedCampaigns;
    }

    /**
     * @notice Retrieves all draft campaigns created by a specific user
     * @param _owner The address of the campaign owner
     * @return Array of draft campaigns owned by the specified address
     * @dev Only returns campaigns with Draft status
     * @dev Useful for user dashboard to show campaigns that can still be edited
     */
    function getUserDraftCampaigns(address _owner) public view returns (CampaignLib.Campaign[] memory) {
        uint256 draftCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignLib.CampaignStatus.Draft) {
                draftCount++;
            }
        }

        CampaignLib.Campaign[] memory draftCampaigns = new CampaignLib.Campaign[](draftCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignLib.CampaignStatus.Draft) {
                draftCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return draftCampaigns;
    }

    /**
     * @notice Retrieves all active campaigns created by a specific user
     * @param _owner The address of the campaign owner
     * @return Array of active campaigns owned by the specified address
     * @dev Only returns campaigns with Published status and deadline > current timestamp
     * @dev Useful for showing a user's campaigns that are currently accepting donations
     */
    function getUserActiveCampaigns(address _owner) public view returns (CampaignLib.Campaign[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner && campaigns[i].status == CampaignLib.CampaignStatus.Published
                    && campaigns[i].deadline > block.timestamp
            ) {
                activeCount++;
            }
        }

        CampaignLib.Campaign[] memory activeCampaigns = new CampaignLib.Campaign[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount && currentIndex < activeCount; i++) {
            if (
                campaigns[i].owner == _owner && campaigns[i].status == CampaignLib.CampaignStatus.Published
                    && campaigns[i].deadline > block.timestamp
            ) {
                activeCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return activeCampaigns;
    }
}