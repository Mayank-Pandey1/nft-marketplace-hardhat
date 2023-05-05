const { ethers } = require("hardhat");

const networkConfig = {
    5: {
        name: "goerli",
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
    },
    11155111: {
        name: "sepolia",
        gasLane:
            "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "500000",
    },
    80001: {
        name: "mumbai",
        gasLane:
            "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        callbackGasLimit: "500000",
    },
    31337: {
        name: "hardhat",
        gasLane:
            "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "500000",
    },
};

const developmentChains = ["localhost", "hardhat"];
const frontEndContractsFile2 =
    "../nft-marketplace-graph-frontend/constants/networkMapping.json";
const frontEndAbiLocation2 = "../nft-marketplace-graph-frontend/constants/";

module.exports = {
    networkConfig,
    developmentChains,
    frontEndContractsFile2,
    frontEndAbiLocation2,
};
