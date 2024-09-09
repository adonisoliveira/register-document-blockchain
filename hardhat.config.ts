import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  gasReporter: {
    enabled: false,
    currency: "BRL",
    gasPrice: 30,
    L1: 'polygon'
  },
  networks: {
    polygon_testnet: {
      url: process.env.RPC_URL,
      chainId: parseInt(process.env.CHAIN_ID || ""),
      accounts: {
        mnemonic: process.env.SECRETE
      }
    }
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY
  }
};

export default config;
