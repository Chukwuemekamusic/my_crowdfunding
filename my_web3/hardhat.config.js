require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // viaIR: true,
    },
  },
  // mocha: {
  //   diff: true,
  //   enableTimeouts: false,
  //   reporter: "spec",
  //   slow: 75,
  // },
};
