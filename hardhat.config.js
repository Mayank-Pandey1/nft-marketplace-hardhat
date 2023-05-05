require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY;

module.exports = {
    // solidity: "0.8.7",
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
    },

    defaultNetwork: "hardhat",

    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts:
                SEPOLIA_PRIVATE_KEY !== undefined ? [SEPOLIA_PRIVATE_KEY] : [],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        mumbai: {
            url: MUMBAI_RPC_URL,
            accounts:
                MUMBAI_PRIVATE_KEY !== undefined ? [MUMBAI_PRIVATE_KEY] : [],
            chainId: 80001,
            blockConfirmations: 6,
            saveDeployments: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
            31337: 1,
        },
        user: {
            default: 1,
            31337: 1,
        },
    },

    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY,
        },
    },
    etherscan: {
        apiKey: {
            polygonMumbai: process.env.POLYGONSCAN_API_KEY,
        },
    },

    gasReporter: {
        enabled: true,
        noColors: true,
        outputFile: "gas-report.txt",
        currency: "INR",
        //coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
};
