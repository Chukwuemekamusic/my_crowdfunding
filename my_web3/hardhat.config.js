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
      viaIR: true, // This is the key addition to solve the stack too deep error
    },
  },
  // networks: {
  //   hardhat: {
  //     chainId: 1337
  //   },
  //   localhost: {
  //     url: "http://127.0.0.1:8545",
  //     chainId: 1337
  //   },
  // },
};
