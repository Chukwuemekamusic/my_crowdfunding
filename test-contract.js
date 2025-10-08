// Quick test script to verify contract on Sepolia
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const CONTRACT_ADDRESS = '0x818fAf7955b42947cAB3AD16f02bDb5ab7463F6A';
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/3Jb3TWD0R5XuZPppWD5PfKgAdfD0HsL-';

async function testContract() {
  try {
    console.log('🔍 Testing contract on Sepolia...\n');

    // Load ABI
    const abiPath = path.join(__dirname, 'my-crowdfunding/abis/CrowdFunding.json');
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // Test 1: Get campaign count
    console.log('Test 1: Getting campaign count...');
    const count = await contract.campaignCount();
    console.log(`✅ Campaign count: ${count.toString()}\n`);

    // Test 2: Call getPublishedCampaigns with pagination
    console.log('Test 2: Calling getPublishedCampaigns...');
    const params = { offset: 0, limit: 12 };
    const result = await contract.getPublishedCampaigns(params);
    console.log(`✅ Published campaigns: ${result[0].length}`);
    console.log(`✅ Total published: ${result[1].toString()}\n`);

    if (result[0].length > 0) {
      console.log('Sample campaign:');
      const campaign = result[0][0];
      console.log(`  - ID: ${campaign.id.toString()}`);
      console.log(`  - Title: ${campaign.title}`);
      console.log(`  - Owner: ${campaign.owner}`);
      console.log(`  - Status: ${campaign.status}`);
    }

    console.log('\n✅ All tests passed! Contract is working correctly on Sepolia.');
  } catch (error) {
    console.error('❌ Error testing contract:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

testContract();
