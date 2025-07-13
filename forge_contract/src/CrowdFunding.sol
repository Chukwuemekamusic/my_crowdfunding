// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import {CampaignLib} from "./CampaignLib.sol";

/**
 * @title CrowdFunding Contract
 * @dev Decentralized crowdfunding platform with draft/published campaign workflow
 */
contract CrowdFunding is Ownable {
    using CampaignLib for *;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    mapping(uint256 => mapping(address => CampaignLib.Donor))
        public campaignDonors;
    mapping(uint256 => CampaignLib.Campaign) public campaigns;
    uint256 public campaignCount = 0;

    // ============================================================================
    // CUSTOM ERRORS
    // ============================================================================

    error ZeroDonation();
    error CampaignNotPublished();
    error CampaignEnded();
    error NotDraftStatus();
    error NotCampaignOwner();
    error CampaignNotFound();
    error WithdrawalFailed();
    error NoDonationsMade();
    error ImageRequired();

    // ============================================================================
    // EVENTS
    // ============================================================================

    event CampaignCreated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 target,
        uint256 deadline,
        CampaignLib.Category category
    );
    event CampaignUpdated(uint256 id);
    event CampaignPublished(uint256 indexed id, address indexed owner);
    event CampaignCancelled(uint256 id, address owner);
    event CampaignDonated(uint256 id, address donator, uint256 amount);
    event FundsWithdrawn(uint256 id, address owner, uint256 amount);

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    modifier onlyDraft(uint256 _id) {
        if (campaigns[_id].status != CampaignLib.CampaignStatus.Draft) {
            revert NotDraftStatus();
        }
        _;
    }

    modifier onlyCampaignOwner(uint256 _id) {
        if (msg.sender != campaigns[_id].owner) revert NotCampaignOwner();
        _;
    }

    modifier validateCampaign(uint256 _id) {
        if (_id >= campaignCount) revert CampaignNotFound();
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor() Ownable(msg.sender) {}

    // ============================================================================
    // CAMPAIGN CREATION FUNCTIONS
    // ============================================================================

    /**
     * @dev Create a draft campaign that can be edited before publishing
     */
    function createDraft(
        CampaignLib.CampaignInput calldata input
    ) public returns (uint256) {
        input.target.validateTarget();
        input.deadline.validateDeadline();
        input.category.validateCategory();

        uint256 newCampaignId = campaignCount;
        CampaignLib.Campaign storage newCampaign = campaigns[campaignCount];

        CampaignLib.initializeCampaign(
            newCampaign,
            newCampaignId,
            msg.sender,
            input,
            CampaignLib.CampaignStatus.Draft
        );

        campaignCount++;

        emit CampaignCreated(
            newCampaignId,
            msg.sender,
            input.title,
            input.target,
            input.deadline,
            input.category
        );

        return newCampaignId;
    }

    /**
     * @dev Create and immediately publish a campaign
     */
    function createPublishedCampaign(
        CampaignLib.CampaignInput calldata input
    ) public returns (uint256) {
        input.target.validateTarget();
        input.deadline.validateDeadline();
        input.category.validateCategory();
        if (bytes(input.image).length == 0) revert ImageRequired();

        uint256 newCampaignId = campaignCount;
        CampaignLib.Campaign storage newCampaign = campaigns[campaignCount];

        CampaignLib.initializeCampaign(
            newCampaign,
            newCampaignId,
            msg.sender,
            input,
            CampaignLib.CampaignStatus.Published
        );

        campaignCount++;

        emit CampaignCreated(
            newCampaignId,
            msg.sender,
            input.title,
            input.target,
            input.deadline,
            input.category
        );

        return newCampaignId;
    }

    // ============================================================================
    // CAMPAIGN MANAGEMENT FUNCTIONS
    // ============================================================================

    /**
     * @dev Update a draft campaign (only owner, only draft status)
     */
    function updateDraftCampaign(
        CampaignLib.CampaignUpdateInput calldata input
    ) public onlyCampaignOwner(input.id) onlyDraft(input.id) {
        input.target.validateTarget();
        input.deadline.validateDeadline();
        input.category.validateCategory();

        CampaignLib.Campaign storage campaign = campaigns[input.id];
        CampaignLib.updateCampaign(campaign, input);

        emit CampaignUpdated(input.id);
    }

    /**
     * @dev Publish a draft campaign (requires image)
     */
    function publishCampaign(
        uint256 _id
    ) public onlyCampaignOwner(_id) onlyDraft(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];
        if (bytes(campaign.image).length == 0) revert ImageRequired();

        campaign.status = CampaignLib.CampaignStatus.Published;
        emit CampaignPublished(_id, msg.sender);
    }

    /**
     * @dev Cancel a draft campaign
     */
    function cancelDraftCampaign(
        uint256 _id
    ) public onlyCampaignOwner(_id) onlyDraft(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];
        campaign.status = CampaignLib.CampaignStatus.Cancelled;
        emit CampaignCancelled(_id, msg.sender);
    }

    // ============================================================================
    // DONATION & WITHDRAWAL FUNCTIONS
    // ============================================================================

    /**
     * @dev Donate to a published, active campaign
     */
    function donateToCampaign(
        uint256 _id
    ) public payable validateCampaign(_id) {
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
     * @dev Withdraw funds from campaign (owner only, with conditions)
     */
    function withdrawCampaignFunds(
        uint256 _id
    ) public validateCampaign(_id) onlyCampaignOwner(_id) {
        CampaignLib.Campaign storage campaign = campaigns[_id];

        campaign.canWithdraw(); // Reverts if conditions aren't met

        uint256 amountToWithdraw = campaign.amountCollected -
            campaign.withdrawnAmount;
        campaign.withdrawnAmount += amountToWithdraw;

        (bool success, ) = payable(campaign.owner).call{
            value: amountToWithdraw
        }("");
        if (!success) revert WithdrawalFailed();

        emit FundsWithdrawn(_id, campaign.owner, amountToWithdraw);
    }

    // ============================================================================
    // BASIC GETTER FUNCTIONS
    // ============================================================================

    function getCampaign(
        uint256 _id,
        bool publishedOnly
    ) public view validateCampaign(_id) returns (CampaignLib.Campaign memory) {
        CampaignLib.Campaign memory campaign = campaigns[_id];

        if (
            publishedOnly &&
            campaign.status != CampaignLib.CampaignStatus.Published
        ) {
            revert CampaignNotPublished();
        }

        return campaign;
    }

    function getCampaignById(
        uint256 _id
    ) public view validateCampaign(_id) returns (CampaignLib.Campaign memory) {
        return campaigns[_id];
    }

    function getCampaigns()
        public
        view
        returns (CampaignLib.Campaign[] memory)
    {
        CampaignLib.Campaign[] memory allCampaigns = new CampaignLib.Campaign[](
            campaignCount
        );
        for (uint256 i = 0; i < campaignCount; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    function getCampaignStatus(
        uint256 _id
    ) public view returns (CampaignLib.CampaignStatus) {
        return campaigns[_id].status;
    }

    function getCampaignOwner(uint256 _id) public view returns (address) {
        return campaigns[_id].owner;
    }

    function getRemainingBalance(uint256 _id) public view returns (uint256) {
        CampaignLib.Campaign storage campaign = campaigns[_id];
        return campaign.amountCollected - campaign.withdrawnAmount;
    }

    // ============================================================================
    // DONOR INFORMATION FUNCTIONS
    // ============================================================================

    function getDonorInfo(
        uint256 _id,
        address _donor
    )
        public
        view
        validateCampaign(_id)
        returns (uint256 amount, uint256 timestamp, uint16 noOfDonations)
    {
        CampaignLib.Donor memory donor = campaignDonors[_id][_donor];
        if (!donor.hasDonated) revert NoDonationsMade();
        return (donor.amount, donor.timestamp, donor.noOfDonations);
    }

    function getDonorCount(uint256 _id) public view returns (uint256) {
        return campaigns[_id].donorCount;
    }

    // ============================================================================
    // CAMPAIGN FILTERING FUNCTIONS
    // ============================================================================

    struct PaginationParams {
        uint256 offset;
        uint256 limit;
    }

    /**
     * @dev Get published campaigns with pagination
     */
    function getPublishedCampaigns(
        PaginationParams calldata params
    )
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
     * @dev Get all published campaigns (for testing - no pagination)
     */
    function getPublishedCampaigns2()
        public
        view
        returns (CampaignLib.Campaign[] memory)
    {
        uint256 publishedCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                publishedCount++;
            }
        }

        CampaignLib.Campaign[]
            memory publishedCampaigns = new CampaignLib.Campaign[](
                publishedCount
            );
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignLib.CampaignStatus.Published) {
                publishedCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return publishedCampaigns;
    }

    function getCampaignsByCategory(
        CampaignLib.Category _category
    ) public view returns (CampaignLib.Campaign[] memory) {
        uint256 categoryCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].category == _category &&
                campaigns[i].status == CampaignLib.CampaignStatus.Published
            ) {
                categoryCount++;
            }
        }

        CampaignLib.Campaign[]
            memory categoryCampaigns = new CampaignLib.Campaign[](
                categoryCount
            );
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].category == _category &&
                campaigns[i].status == CampaignLib.CampaignStatus.Published
            ) {
                categoryCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return categoryCampaigns;
    }

    function getActiveCampaigns()
        public
        view
        returns (CampaignLib.Campaign[] memory)
    {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].status == CampaignLib.CampaignStatus.Published &&
                campaigns[i].deadline > block.timestamp
            ) {
                activeCount++;
            }
        }

        CampaignLib.Campaign[]
            memory activeCampaigns = new CampaignLib.Campaign[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].status == CampaignLib.CampaignStatus.Published &&
                campaigns[i].deadline > block.timestamp
            ) {
                activeCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return activeCampaigns;
    }

    // ============================================================================
    // USER-SPECIFIC CAMPAIGN FUNCTIONS
    // ============================================================================

    function getUserCampaigns(
        address _owner
    ) public view returns (CampaignLib.Campaign[] memory) {
        uint256 userCampaignCount = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                userCampaignCount++;
            }
        }

        CampaignLib.Campaign[]
            memory userCampaigns = new CampaignLib.Campaign[](
                userCampaignCount
            );
        uint256 currentIndex = 0;

        for (
            uint256 i = 0;
            i < campaignCount && currentIndex < userCampaignCount;
            i++
        ) {
            if (campaigns[i].owner == _owner) {
                userCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return userCampaigns;
    }

    function getUserPublishedCampaigns(
        address _owner
    ) public view returns (CampaignLib.Campaign[] memory) {
        uint256 publishedCount = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignLib.CampaignStatus.Published
            ) {
                publishedCount++;
            }
        }

        CampaignLib.Campaign[]
            memory publishedCampaigns = new CampaignLib.Campaign[](
                publishedCount
            );
        uint256 currentIndex = 0;

        for (
            uint256 i = 0;
            i < campaignCount && currentIndex < publishedCount;
            i++
        ) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignLib.CampaignStatus.Published
            ) {
                publishedCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return publishedCampaigns;
    }

    function getUserDraftCampaigns(
        address _owner
    ) public view returns (CampaignLib.Campaign[] memory) {
        uint256 draftCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignLib.CampaignStatus.Draft
            ) {
                draftCount++;
            }
        }

        CampaignLib.Campaign[]
            memory draftCampaigns = new CampaignLib.Campaign[](draftCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignLib.CampaignStatus.Draft
            ) {
                draftCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return draftCampaigns;
    }

    function getUserActiveCampaigns(
        address _owner
    ) public view returns (CampaignLib.Campaign[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignLib.CampaignStatus.Published &&
                campaigns[i].deadline > block.timestamp
            ) {
                activeCount++;
            }
        }

        CampaignLib.Campaign[]
            memory activeCampaigns = new CampaignLib.Campaign[](activeCount);
        uint256 currentIndex = 0;

        for (
            uint256 i = 0;
            i < campaignCount && currentIndex < activeCount;
            i++
        ) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignLib.CampaignStatus.Published &&
                campaigns[i].deadline > block.timestamp
            ) {
                activeCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return activeCampaigns;
    }
}
