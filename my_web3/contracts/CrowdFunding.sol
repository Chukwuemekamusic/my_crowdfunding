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

    mapping(uint256 => mapping(address => Donor)) public campaignDonors;
    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount = 0;

    // Events
    event CampaignCreated(
        uint256 id,
        address owner,
        string title,
        string description,
        uint256 target,
        uint256 deadline,
        string image,
        Category category,
        CampaignStatus status,
        bool allowFlexibleWithdrawal
    );

    event CampaignUpdated(
        uint256 id,
        string title,
        string description,
        uint256 target,
        uint256 deadline,
        string image,
        Category category
    );

    event CampaignPublished(uint256 id, address owner);
    event CampaignCancelled(uint256 id, address owner);
    event CampaignDonated(uint256 id, address donator, uint256 amount);
    event FundsWithdrawn(uint256 id, address owner, uint256 amount);

    constructor() ERC721("CrowdFunding", "CROWD") Ownable(msg.sender) {}

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image,
        Category _category,
        bool _publishImmediately,
        bool _allowFlexibleWithdrawal
    ) public returns (uint256) {
        if (_target == 0) revert InvalidTarget();
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (uint8(_category) > uint8(Category.Other)) revert InvalidCategory();

        uint256 newCampaignId = campaignCount;
        Campaign storage newCampaign = campaigns[campaignCount];

        newCampaign.id = newCampaignId;
        newCampaign.owner = msg.sender;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.withdrawnAmount = 0;
        newCampaign.image = _image;
        newCampaign.category = _category;
        newCampaign.status = _publishImmediately
            ? CampaignStatus.Published
            : CampaignStatus.Draft;
        newCampaign.donorCount = 0;
        newCampaign.allowFlexibleWithdrawal = _allowFlexibleWithdrawal;

        campaignCount++;

        emit CampaignCreated(
            newCampaignId,
            msg.sender,
            _title,
            _description,
            _target,
            _deadline,
            _image,
            _category,
            newCampaign.status,
            _allowFlexibleWithdrawal
        );

        return newCampaignId;
    }

    modifier onlyDraft(uint256 _id) {
        if (campaigns[_id].status != CampaignStatus.Draft)
            revert NotDraftStatus();
        _;
    }

    modifier onlyCampaignOwner(uint256 _id) {
        if (msg.sender != campaigns[_id].owner) revert NotCampaignOwner();
        _;
    }

    function updateDraftCampaign(
        uint256 _id,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image,
        Category _category
    ) public onlyCampaignOwner(_id) onlyDraft(_id) {
        if (_target == 0) revert InvalidTarget();
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (uint8(_category) > uint8(Category.Other)) revert InvalidCategory();

        Campaign storage campaign = campaigns[_id];

        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.image = _image;
        campaign.category = _category;

        emit CampaignUpdated(
            _id,
            _title,
            _description,
            _target,
            _deadline,
            _image,
            _category
        );
    }

    function publishCampaign(
        uint256 _id
    ) public onlyCampaignOwner(_id) onlyDraft(_id) {
        Campaign storage campaign = campaigns[_id];
        campaign.status = CampaignStatus.Published;
        emit CampaignPublished(_id, msg.sender);
    }

    function cancelDraftCampaign(
        uint256 _id
    ) public onlyCampaignOwner(_id) onlyDraft(_id) {
        Campaign storage campaign = campaigns[_id];
        campaign.status = CampaignStatus.Cancelled;
        emit CampaignCancelled(_id, msg.sender);
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];

        if (msg.value == 0) revert ZeroDonation();
        if (campaign.status != CampaignStatus.Published)
            revert CampaignNotPublished();
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

    function withdrawCampaignFunds(uint256 _id) public onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];
        uint256 availableBalance = campaign.amountCollected -
            campaign.withdrawnAmount;

        if (availableBalance == 0) revert InsufficientBalance();

        if (!campaign.allowFlexibleWithdrawal) {
            if (block.timestamp <= campaign.deadline) revert CampaignActive();
        }

        uint256 amount = availableBalance;
        campaign.withdrawnAmount += amount;

        (bool success, ) = payable(campaign.owner).call{value: amount}("");
        if (!success) revert WithdrawalFailed();

        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    // View functions with status filters

    // TODO: consider if we should have a separate function to return published campaign
    function getCampaign(
        uint256 _id,
        bool publishedOnly
    ) public view returns (Campaign memory) {
        if (_id >= campaignCount) revert CampaignNotFound();
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

    function getPublishedCampaigns() public view returns (Campaign[] memory) {
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

    function getUserDraftCampaigns(
        address _owner
    ) public view returns (Campaign[] memory) {
        uint256 draftCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignStatus.Draft
            ) {
                draftCount++;
            }
        }

        Campaign[] memory draftCampaigns = new Campaign[](draftCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].owner == _owner &&
                campaigns[i].status == CampaignStatus.Draft
            ) {
                draftCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return draftCampaigns;
    }

    function getRemainingBalance(uint256 _id) public view returns (uint256) {
        Campaign storage campaign = campaigns[_id];
        return campaign.amountCollected - campaign.withdrawnAmount;
    }

    function getDonorInfo(
        uint256 _id,
        address _donor
    )
        public
        view
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
    function getCampaignsByCategory(
        Category _category
    ) public view returns (Campaign[] memory) {
        uint256 categoryCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].category == _category &&
                campaigns[i].status == CampaignStatus.Published
            ) {
                categoryCount++;
            }
        }

        Campaign[] memory categoryCampaigns = new Campaign[](categoryCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].category == _category &&
                campaigns[i].status == CampaignStatus.Published
            ) {
                categoryCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return categoryCampaigns;
    }

    function getActiveCampaigns() public view returns (Campaign[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].status == CampaignStatus.Published &&
                campaigns[i].deadline > block.timestamp
            ) {
                activeCount++;
            }
        }

        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (
                campaigns[i].status == CampaignStatus.Published &&
                campaigns[i].deadline > block.timestamp
            ) {
                activeCampaigns[currentIndex] = campaigns[i];
                currentIndex++;
            }
        }

        return activeCampaigns;
    }
}

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
