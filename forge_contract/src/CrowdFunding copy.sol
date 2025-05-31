// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdFunding is ERC721, Ownable {
    // Custom Errors
    error ZeroDonation();
    error DeadlinePassed();
    error InvalidCategory();
    error InvalidDeadline();
    error InvalidTarget();
    error CampaignNotPublished();
    error CampaignEnded();
    error NotDraftStatus();
    error NotCampaignOwner();
    error CampaignNotFound();
    error WithdrawalFailed();
    error InsufficientBalance();
    error NoDonationsMade();
    error WithdrawalNotAllowed();
    error CampaignActive();
    error ImageRequired();

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
        uint256 deadline; // TODO: LATER CHANGE deadline uint40
        uint256 amountCollected;
        uint256 withdrawnAmount;
        string image;
        Category category;
        CampaignStatus status;
        uint256 donorCount; // TODO: donorCount uint32
        bool allowFlexibleWithdrawal;
    }

    mapping(uint256 => mapping(address => Donor)) public campaignDonors;
    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount = 0;
    address public immutable i_owner;

    // Events
    event CampaignCreated(
        uint256 indexed id, address indexed owner, string title, uint256 target, uint256 deadline, Category category
    );

    event CampaignUpdated(uint256 id);

    event CampaignPublished(uint256 indexed id, address indexed owner);
    event CampaignCancelled(uint256 id, address owner);
    event CampaignDonated(uint256 id, address donator, uint256 amount);
    event FundsWithdrawn(uint256 id, address owner, uint256 amount);

    constructor() ERC721("CrowdFunding", "CROWD") Ownable(msg.sender) {
        i_owner = msg.sender;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    struct CampaignInput {
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        string image;
        Category category;
        // bool publishImmediately;
        bool allowFlexibleWithdrawal;
    }

    // Create Draft Campaign
    function createDraft(CampaignInput calldata input) public returns (uint256) {
        if (input.target == 0) revert InvalidTarget();
        if (input.deadline <= block.timestamp) revert InvalidDeadline();
        if (uint8(input.category) > uint8(Category.Other)) {
            revert InvalidCategory();
        }

        uint256 newCampaignId = campaignCount;
        Campaign storage newCampaign = campaigns[campaignCount];

        newCampaign.id = newCampaignId;
        newCampaign.owner = msg.sender;
        newCampaign.title = input.title;
        newCampaign.description = input.description;
        newCampaign.target = input.target;
        newCampaign.deadline = input.deadline;
        newCampaign.amountCollected = 0;
        newCampaign.withdrawnAmount = 0;
        newCampaign.image = input.image;
        newCampaign.category = input.category;
        newCampaign.status = CampaignStatus.Draft;
        newCampaign.donorCount = 0;
        newCampaign.allowFlexibleWithdrawal = input.allowFlexibleWithdrawal;

        campaignCount++;

        emit CampaignCreated(newCampaignId, msg.sender, input.title, input.target, input.deadline, input.category);

        return newCampaignId;
    }

    function createPublishedCampaign(CampaignInput calldata input) public returns (uint256) {
        if (input.target == 0) revert InvalidTarget();
        if (input.deadline <= block.timestamp) revert InvalidDeadline();
        if (uint8(input.category) > uint8(Category.Other)) {
            revert InvalidCategory();
        }
        if (bytes(input.image).length == 0) revert ImageRequired();

        uint256 newCampaignId = campaignCount;
        Campaign storage newCampaign = campaigns[campaignCount];

        newCampaign.id = newCampaignId;
        newCampaign.owner = msg.sender;
        newCampaign.title = input.title;
        newCampaign.description = input.description;
        newCampaign.target = input.target;
        newCampaign.deadline = input.deadline;
        newCampaign.amountCollected = 0;
        newCampaign.withdrawnAmount = 0;
        newCampaign.image = input.image;
        newCampaign.category = input.category;
        newCampaign.status = CampaignStatus.Published;
        newCampaign.donorCount = 0;
        newCampaign.allowFlexibleWithdrawal = input.allowFlexibleWithdrawal;

        campaignCount++;

        emit CampaignCreated(newCampaignId, msg.sender, input.title, input.target, input.deadline, input.category);

        return newCampaignId;
    }

    modifier onlyDraft(uint256 _id) {
        if (campaigns[_id].status != CampaignStatus.Draft) {
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

    struct CampaignUpdateInput {
        uint256 id;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        string image;
        Category category;
    }

    function updateDraftCampaign(CampaignUpdateInput calldata input)
        public
        onlyCampaignOwner(input.id)
        onlyDraft(input.id)
    {
        if (input.target == 0) revert InvalidTarget();
        if (input.deadline <= block.timestamp) revert InvalidDeadline();
        if (uint8(input.category) > uint8(Category.Other)) {
            revert InvalidCategory();
        }

        Campaign storage campaign = campaigns[input.id];

        campaign.title = input.title;
        campaign.description = input.description;
        campaign.target = input.target;
        campaign.deadline = input.deadline;
        campaign.image = input.image;
        campaign.category = input.category;

        emit CampaignUpdated(input.id);
    }

    function publishCampaign(uint256 _id) public onlyCampaignOwner(_id) onlyDraft(_id) {
        Campaign storage campaign = campaigns[_id];
        if (bytes(campaign.image).length == 0) revert ImageRequired();
        campaign.status = CampaignStatus.Published;
        emit CampaignPublished(_id, msg.sender);
    }

    function cancelDraftCampaign(uint256 _id) public onlyCampaignOwner(_id) onlyDraft(_id) {
        Campaign storage campaign = campaigns[_id];
        campaign.status = CampaignStatus.Cancelled;
        emit CampaignCancelled(_id, msg.sender);
    }

    function donateToCampaign(uint256 _id) public payable validateCampaign(_id) {
        Campaign storage campaign = campaigns[_id];

        if (msg.value == 0) revert ZeroDonation();
        if (campaign.status != CampaignStatus.Published) {
            revert CampaignNotPublished();
        }
        if (campaign.deadline <= block.timestamp) revert CampaignEnded();

        Donor storage donor = campaignDonors[_id][msg.sender];

        if (!donor.hasDonated) {
            campaign.donorCount++;
        }

        // Cast to uint128 since we optimized the Donor struct
        donor.amount += uint128(msg.value);
        donor.timestamp = uint64(block.timestamp);
        donor.hasDonated = true;
        donor.noOfDonations++;

        campaign.amountCollected += msg.value;

        emit CampaignDonated(_id, msg.sender, msg.value);
    }

    function withdrawCampaignFunds(uint256 _id) public validateCampaign(_id) onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];
        uint256 availableBalance = campaign.amountCollected - campaign.withdrawnAmount;

        if (availableBalance == 0) revert InsufficientBalance();

        if (!campaign.allowFlexibleWithdrawal) {
            if (block.timestamp <= campaign.deadline) revert CampaignActive();
        }

        uint256 amount = availableBalance;
        campaign.withdrawnAmount += amount;

        (bool success,) = payable(campaign.owner).call{value: amount}("");
        if (!success) revert WithdrawalFailed();

        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    // View functions with status filters

    function getCampaign(uint256 _id, bool publishedOnly) public view validateCampaign(_id) returns (Campaign memory) {
        Campaign memory campaign = campaigns[_id];

        if (publishedOnly && campaign.status != CampaignStatus.Published) {
            revert CampaignNotPublished();
        }

        return campaign;
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    function getCampaignStatus(uint256 _id) public view returns (CampaignStatus) {
        return campaigns[_id].status;
    }

    function getCampaignOwner(uint256 _id) public view returns (address) {
        return campaigns[_id].owner;
    }

    struct PaginationParams {
        uint256 offset;
        uint256 limit;
    }

    // with pagination
    function getPublishedCampaigns(PaginationParams calldata params)
        public
        view
        returns (Campaign[] memory _campaigns, uint256 total)
    {
        uint256 count = 0;
        total = 0;

        // First, count total published campaigns
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Published) {
                total++;
            }
        }
        // Create array of appropriate size
        uint256 size = params.limit;
        if (params.offset + size > total) {
            size = total - params.offset;
        }
        _campaigns = new Campaign[](size);

        // Fill array
        uint256 current = 0;
        for (uint256 i = 0; i < campaignCount && current < size; i++) {
            if (campaigns[i].status == CampaignStatus.Published) {
                if (count >= params.offset) {
                    _campaigns[current] = campaigns[i];
                    current++;
                }
                count++;
            }
        }

        return (_campaigns, total);
    }

    // without pagination - just for test
    function getPublishedCampaigns2() public view returns (Campaign[] memory) {
        uint256 publishedCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Published) {
                publishedCount++;
            }
        }

        Campaign[] memory publishedCampaigns = new Campaign[](publishedCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Published) {
                publishedCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return publishedCampaigns;
    }

    // Get User's Campaigns
    function getUserCampaigns(address _owner) public view returns (Campaign[] memory) {
        uint256 userCampaignCount = 0;

        // First, count user's campaigns
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                userCampaignCount++;
            }
        }

        // Create array of appropriate size
        Campaign[] memory userCampaigns = new Campaign[](userCampaignCount);
        uint256 currentIndex = 0;

        // Fill array with user's campaigns
        for (uint256 i = 0; i < campaignCount && currentIndex < userCampaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                userCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return userCampaigns;
    }

    // Get User's Published Campaigns
    function getUserPublishedCampaigns(address _owner) public view returns (Campaign[] memory) {
        uint256 publishedCount = 0;

        // Count user's published campaigns
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignStatus.Published) {
                publishedCount++;
            }
        }

        // Create array of appropriate size
        Campaign[] memory publishedCampaigns = new Campaign[](publishedCount);
        uint256 currentIndex = 0;

        // Fill array with user's published campaigns
        for (uint256 i = 0; i < campaignCount && currentIndex < publishedCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignStatus.Published) {
                publishedCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return publishedCampaigns;
    }

    function getUserDraftCampaigns(address _owner) public view returns (Campaign[] memory) {
        uint256 draftCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignStatus.Draft) {
                draftCount++;
            }
        }

        Campaign[] memory draftCampaigns = new Campaign[](draftCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].owner == _owner && campaigns[i].status == CampaignStatus.Draft) {
                draftCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return draftCampaigns;
    }

    // Get User's Active Campaigns
    function getUserActiveCampaigns(address _owner) public view returns (Campaign[] memory) {
        uint256 activeCount = 0;

        // Count user's active campaigns
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner && campaigns[i].status == CampaignStatus.Published
                    && campaigns[i].deadline > block.timestamp
            ) {
                activeCount++;
            }
        }

        // Create array of appropriate size
        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256 currentIndex = 0;

        // Fill array
        for (uint256 i = 0; i < campaignCount && currentIndex < activeCount; i++) {
            if (
                campaigns[i].owner == _owner && campaigns[i].status == CampaignStatus.Published
                    && campaigns[i].deadline > block.timestamp
            ) {
                activeCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return activeCampaigns;
    }

    function getRemainingBalance(uint256 _id) public view returns (uint256) {
        Campaign storage campaign = campaigns[_id];
        return campaign.amountCollected - campaign.withdrawnAmount;
    }

    function getDonorInfo(uint256 _id, address _donor)
        public
        view
        validateCampaign(_id)
        returns (uint256 amount, uint256 timestamp, uint16 noOfDonations)
    {
        Donor memory donor = campaignDonors[_id][_donor];
        if (!donor.hasDonated) revert NoDonationsMade();
        return (donor.amount, donor.timestamp, donor.noOfDonations);
    }

    function getDonorCount(uint256 _id) public view returns (uint256) {
        return campaigns[_id].donorCount;
    }

    // New helper functions
    function getCampaignsByCategory(Category _category) public view returns (Campaign[] memory) {
        uint256 categoryCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].category == _category && campaigns[i].status == CampaignStatus.Published) {
                categoryCount++;
            }
        }

        Campaign[] memory categoryCampaigns = new Campaign[](categoryCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].category == _category && campaigns[i].status == CampaignStatus.Published) {
                categoryCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return categoryCampaigns;
    }

    function getActiveCampaigns() public view returns (Campaign[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Published && campaigns[i].deadline > block.timestamp) {
                activeCount++;
            }
        }

        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Published && campaigns[i].deadline > block.timestamp) {
                activeCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return activeCampaigns;
    }
}

// function createCampaign(
//     CampaignInput calldata input
// ) public returns (uint256) {
//     if (input.target == 0) revert InvalidTarget();
//     if (input.deadline <= block.timestamp) revert InvalidDeadline();
//     if (uint8(input.category) > uint8(Category.Other))
//         revert InvalidCategory();

//     uint256 newCampaignId = campaignCount;
//     Campaign storage newCampaign = campaigns[campaignCount];

//     newCampaign.id = newCampaignId;
//     newCampaign.owner = msg.sender;
//     newCampaign.title = input.title;
//     newCampaign.description = input.description;
//     newCampaign.target = input.target;
//     newCampaign.deadline = input.deadline;
//     newCampaign.amountCollected = 0;
//     newCampaign.withdrawnAmount = 0;
//     newCampaign.image = input.image;
//     newCampaign.category = input.category;
//     newCampaign.status = input.publishImmediately
//         ? CampaignStatus.Published
//         : CampaignStatus.Draft;
//     newCampaign.donorCount = 0;
//     newCampaign.allowFlexibleWithdrawal = input.allowFlexibleWithdrawal;

//     campaignCount++;

//     emit CampaignCreated(
//         newCampaignId,
//         msg.sender,
//         input.title,
//         input.target,
//         input.deadline,
//         input.category
//     );

//     return newCampaignId;
// }

// function sendFundsToCampaignOwner(uint256 _id) public onlyOwner {
//     Campaign storage campaign = campaigns[_id];
//     require(campaign.amountCollected > 0, "No funds to withdraw.");
//     require(campaign.currentBalance > 0, "No funds to withdraw.");
//     require(
//         campaign.deadline < block.timestamp,
//         "The campaign has not ended yet."
//     );
//     uint256 amount = campaign.currentBalance;
//     campaign.currentBalance = 0;

//     (bool success, ) = payable(campaign.owner).call{value: amount}("");
//     require(success, "Transfer failed");
//     campaign.currentBalance = 0;
//     // emit FundsWithdrawn(_id, msg.sender, campaign.currentBalance);
// }
