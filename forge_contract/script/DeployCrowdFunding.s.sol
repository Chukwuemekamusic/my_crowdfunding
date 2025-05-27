// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {CrowdFunding} from "../src/CrowdFunding.sol";

contract DeployCrowdFundingWithCampaigns is Script {
    function run() external returns (CrowdFunding) {
        string memory jsonPath = string.concat(
            vm.projectRoot(),
            "/campaigns.json"
        );
        string memory campaignsJson = vm.readFile(jsonPath);

        vm.startBroadcast();
        CrowdFunding crowdFunding = new CrowdFunding();
        console.log("msg.sender during deployment:", msg.sender);
        console.log("vm signer:", vm.addr(1));
        console.log("deployer address:", address(this));

        for (uint256 i = 0; i < 3; i++) {
            string memory key = string.concat("$[", vm.toString(i), "]");
            CrowdFunding.CampaignInput memory data = CrowdFunding.CampaignInput(
                abi.decode(
                    vm.parseJson(campaignsJson, string.concat(key, ".title")),
                    (string)
                ),
                abi.decode(
                    vm.parseJson(
                        campaignsJson,
                        string.concat(key, ".description")
                    ),
                    (string)
                ),
                abi.decode(
                    vm.parseJson(campaignsJson, string.concat(key, ".target")),
                    (uint256)
                ),
                abi.decode(
                    vm.parseJson(
                        campaignsJson,
                        string.concat(key, ".deadline")
                    ),
                    (uint256)
                ),
                abi.decode(
                    vm.parseJson(campaignsJson, string.concat(key, ".image")),
                    (string)
                ),
                abi.decode(
                    vm.parseJson(
                        campaignsJson,
                        string.concat(key, ".category")
                    ),
                    (CrowdFunding.Category)
                ),
                abi.decode(
                    vm.parseJson(
                        campaignsJson,
                        string.concat(key, ".allowFlexibleWithdrawal")
                    ),
                    (bool)
                )
            );
            crowdFunding.createPublishedCampaign(data);
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
