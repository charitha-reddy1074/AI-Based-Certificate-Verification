import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

export default {
  solidity: "0.8.20",
  networks: {
    polygonMumbai: {
      url: process.env.ETH_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon: {
      url: process.env.ETH_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
