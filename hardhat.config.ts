import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import * as dotenv from "dotenv";

const COINMARKETCAP_KEY = process.env.COINMARKETCAP_API_KEY;

const config: HardhatUserConfig = {
	solidity: "0.8.24",
	gasReporter: {
		currency: "USD",
		L1: "ethereum",
		coinmarketcap: COINMARKETCAP_KEY!,
	},
};

export default config;
