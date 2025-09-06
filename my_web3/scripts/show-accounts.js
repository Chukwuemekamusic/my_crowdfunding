const hre = require("hardhat");

/**
 * Simple script to display available accounts and their balances
 */
async function main() {
  try {
    console.log("🔍 Available Accounts on", hre.network.name);
    console.log("=" .repeat(50));

    const accounts = await hre.ethers.getSigners();
    
    for (let i = 0; i < Math.min(accounts.length, 10); i++) {
      const account = accounts[i];
      const balance = await hre.ethers.provider.getBalance(account.address);
      const balanceInEth = hre.ethers.formatEther(balance);
      
      console.log(`Account ${i}:`);
      console.log(`  Address: ${account.address}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      console.log();
    }

    if (accounts.length > 10) {
      console.log(`... and ${accounts.length - 10} more accounts`);
    }

  } catch (error) {
    console.error("❌ Error fetching accounts:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}

module.exports = { main };