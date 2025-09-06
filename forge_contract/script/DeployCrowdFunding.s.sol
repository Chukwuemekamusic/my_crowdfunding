// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {CrowdFunding} from "../src/CrowdFunding.sol";
import {CampaignLib} from "../src/CampaignLib.sol";

contract DeployCrowdFundingWithCampaigns is Script {
    function run() external returns (CrowdFunding) {
        string memory jsonPath = string.concat(vm.projectRoot(), "/campaigns.json");
        string memory campaignsJson = vm.readFile(jsonPath);

        vm.startBroadcast();
        CrowdFunding crowdFunding = new CrowdFunding();
        // console.log("msg.sender during deployment:", msg.sender);
        // console.log("vm signer:", vm.addr(1));
        // console.log("deployer address:", address(this));

        // Define dynamic deadlines (hours from deployment)
        uint256[3] memory deadlineHours = [uint256(1), uint256(24), uint256(72)]; // 1 hour, 1 day, 3 days
        
        for (uint256 i = 0; i < 3; i++) {
            string memory key = string.concat("$[", vm.toString(i), "]");
            
            // Calculate dynamic deadline: current time + specified hours
            uint256 dynamicDeadline = block.timestamp + (deadlineHours[i] * 3600);
            
            CampaignLib.CampaignInput memory data = CampaignLib.CampaignInput(
                abi.decode(vm.parseJson(campaignsJson, string.concat(key, ".title")), (string)),
                abi.decode(vm.parseJson(campaignsJson, string.concat(key, ".description")), (string)),
                abi.decode(vm.parseJson(campaignsJson, string.concat(key, ".target")), (uint256)),
                dynamicDeadline, // Use calculated deadline instead of JSON value
                abi.decode(vm.parseJson(campaignsJson, string.concat(key, ".image")), (string)),
                abi.decode(vm.parseJson(campaignsJson, string.concat(key, ".category")), (CampaignLib.Category)),
                abi.decode(vm.parseJson(campaignsJson, string.concat(key, ".allowFlexibleWithdrawal")), (bool))
            );
            crowdFunding.createPublishedCampaign(data);
            
            console.log("Campaign %s deadline: %s (%s hours from now)", i, dynamicDeadline, deadlineHours[i]);
        }
        console.log("Campaigns created successfully");
        console.log("Contract address: %s", address(crowdFunding));
        console.log("Campaigns created: %s", crowdFunding.campaignCount());

        vm.stopBroadcast();
        return crowdFunding;
    }
}

contract DeployCrowdFunding is Script {
    function run() external {
        vm.startBroadcast();
        new CrowdFunding();
        vm.stopBroadcast();
    }
}
