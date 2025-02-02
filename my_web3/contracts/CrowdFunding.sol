// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdFunding is ERC721, Ownable {
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

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        uint256 currentBalance;
        string image;
        Category category;
        CampaignStatus status;
        address[] donators;
        uint256[] donations;
    }

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
        CampaignStatus status
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

    constructor() ERC721("CrowdFunding", "CF") Ownable(msg.sender) {}

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image,
        Category _category,
        bool _publishImmediately
    ) public returns (uint256) {
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(uint8(_category) <= uint8(Category.Other), "Invalid category");

        Campaign storage newCampaign = campaigns[campaignCount];

        newCampaign.owner = msg.sender;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.currentBalance = 0;
        newCampaign.image = _image;
        newCampaign.category = _category;
        newCampaign.status = _publishImmediately
            ? CampaignStatus.Published
            : CampaignStatus.Draft;
        newCampaign.donators = new address[](0);
        newCampaign.donations = new uint256[](0);

        uint256 newCampaignId = campaignCount;
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
            newCampaign.status
        );

        return newCampaignId;
    }

    modifier onlyDraft(uint256 _id) {
        require(
            campaigns[_id].status == CampaignStatus.Draft,
            "Campaign is not in draft status"
        );
        _;
    }

    modifier onlyCampaignOwner(uint256 _id) {
        require(
            msg.sender == campaigns[_id].owner,
            "Only the owner can call this function"
        );
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
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(uint8(_category) <= uint8(Category.Other), "Invalid category");

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

        require(msg.value > 0, "Donation amount must be greater than 0");
        require(
            campaign.status == CampaignStatus.Published,
            "Campaign is not published"
        );
        require(campaign.deadline > block.timestamp, "Campaign has ended");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;
        campaign.currentBalance += msg.value;

        emit CampaignDonated(_id, msg.sender, msg.value);
    }

    // View functions with status filters
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

    // Other existing functions remain the same...
    function withdrawCampaignFunds(uint256 _id) public onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];
        require(campaign.currentBalance > 0, "No funds to withdraw");
        require(campaign.deadline < block.timestamp, "Campaign still active");

        uint256 amount = campaign.currentBalance;
        campaign.currentBalance = 0;

        (bool success, ) = payable(campaign.owner).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    function sendFundsToCampaignOwner(uint256 _id) public onlyOwner {
        Campaign storage campaign = campaigns[_id];
        require(campaign.amountCollected > 0, "No funds to withdraw.");
        require(campaign.currentBalance > 0, "No funds to withdraw.");
        require(
            campaign.deadline < block.timestamp,
            "The campaign has not ended yet."
        );
        uint256 amount = campaign.currentBalance;
        campaign.currentBalance = 0;

        (bool success, ) = payable(campaign.owner).call{value: amount}("");
        require(success, "Transfer failed");
        campaign.currentBalance = 0;
        // emit FundsWithdrawn(_id, msg.sender, campaign.currentBalance);
    }

    function amountPaidToOwner(uint256 _id) public view returns (uint256) {
        Campaign storage campaign = campaigns[_id];
        return campaign.amountCollected - campaign.currentBalance;
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        Campaign storage campaign = campaigns[_id];
        return (campaign.donators, campaign.donations);
    }
}
