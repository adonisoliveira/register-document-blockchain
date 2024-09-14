import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200
      }
    },
  },
  gasReporter: {
    enabled: false,
    currency: "BRL",
    gasPrice: 50,
    L1: "polygon",
    coinmarketcap: "8a2d81c2-53d9-498a-b0d6-b49ba168d5e9"
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: "edge autumn drama swift message magic unveil train genuine group casual couple"
      }
    },
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

