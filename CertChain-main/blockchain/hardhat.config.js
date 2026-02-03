require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    polygonMumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_private_key_here') ? [process.env.PRIVATE_KEY] : []
    },
    polygonMainnet: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_private_key_here') ? [process.env.PRIVATE_KEY] : []
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_private_key_here') ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY
    }
  }
};