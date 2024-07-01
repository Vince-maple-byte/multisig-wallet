//Multisig contract tests
import { expect } from "chai";
import hre from "hardhat";

describe("Multi Signature", () => {
	let multisig: any;
	let numberOfConfirmations: number;
	let owners: any;

	beforeEach(async () => {
		const signers = await hre.ethers.getSigners();
		owners = signers.slice(0, 10).map((signer) => signer.address);
		numberOfConfirmations = 6;
		multisig = await hre.ethers.deployContract("Multsig", [
			owners,
			numberOfConfirmations,
		]);
	});

	it("Should have the same numberOfConfirmations", async () => {
		expect(await multisig.numberOfConfirmations()).to.equal(
			numberOfConfirmations
		);
	});

	it("Should have the same amount of owners", async () => {
		console.log(await multisig.getOwners()[0]);
		const contractOwners = await multisig.getOwners();
		expect(contractOwners.length).to.equal(owners.length);
	});

	it("Should return a revert that it is not an owner", async () => {
		const signers = await hre.ethers.getSigners();
		const nonOwners = signers.slice(10, 20).map((signer) => signer.address);

		await expect(
			multisig
				.connect(signers[11])
				.newTransaction(nonOwners[1], 1000000, "0x")
		).to.be.revertedWith("Not an owner");
	});
});
