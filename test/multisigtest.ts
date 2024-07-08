//Multisig contract tests
import { expect } from "chai";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Multi Signature", () => {
	let multisig: any;
	let numberOfConfirmations: number;
	let owners: string[];
	let signers: HardhatEthersSigner[];

	beforeEach(async () => {
		signers = await hre.ethers.getSigners();
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

	it("Should have the wallet increase the balance", async () => {
		const contractAddress = await multisig.getAddress();

		await signers[0].sendTransaction({
			to: contractAddress,
			value: "100000",
		});
		const contractBalance = await signers[0].provider.getBalance(
			contractAddress
		);
		expect(contractBalance).to.equal("100000");
	});

	describe("New Transaction Tests", () => {
		it("Should return a revert that it is not an owner sending a new transaction", async () => {
			const nonOwners = signers
				.slice(10, 20)
				.map((signer) => signer.address);

			await expect(
				multisig
					.connect(signers[11])
					.newTransaction(nonOwners[1], 1000000, "0x")
			).to.be.revertedWith("Not an owner");
		});

		it("Should add a new transaction with a correct user", async () => {
			await expect(
				multisig.newTransaction(signers[11].address, 1000000, "0x")
			).to.emit(multisig, "NewTransaction");
		});

		it("Should add a new transaction and be ready to submit a transaction if the number of confirmations are 1", async () => {
			const owner = signers.slice(0, 10).map((signer) => signer.address);
			const confirm = 1;
			const contract = await hre.ethers.deployContract("Multsig", [
				owner,
				confirm,
			]);

			await expect(
				contract
					.connect(signers[0])
					.newTransaction(signers[11].address, 1000000, "0x")
			).to.emit(contract, "SubmitTransaction");
		});
	});

	describe("Confirm transaction Tests", () => {
		beforeEach(async () => {
			await multisig.newTransaction(owners[0], 100000, "0x");
		});

		it("Should emit ConfirmTransaction for a valid confirmTransaction call", async () => {
			await expect(
				multisig.connect(signers[1]).confirmTransaction(0)
			).to.emit(multisig, "ConfirmTransaction");
		});

		it("Should have add a new confirmation and the confirmations should be at 2", async () => {
			await multisig.connect(signers[1]).confirmTransaction(0);
			const x = await multisig.getTransactions();
			expect(await x[0].confirmations).to.equal(2);
		});

		it("Should emit SubmitTransaction if the confirmation == numberOfConfirmations", async () => {
			for (let i = 1; i < 5; i++) {
				await multisig.connect(signers[i]).confirmTransaction(0);
			}

			await expect(
				multisig.connect(signers[5]).confirmTransaction(0)
			).to.emit(multisig, "SubmitTransaction");
		});

		it("Should send a require for onlyOwners when a nonOwner calls the function", async () => {
			await expect(
				multisig.connect(signers[11]).confirmTransaction(0)
			).to.be.revertedWith("Not an owner");
		});

		it("Should send a require for transactionExists when a transaction index is sent for a transaction that doesn't exist", async () => {
			await expect(
				multisig.connect(signers[6]).confirmTransaction(1)
			).to.be.revertedWith("Transaction does not exist");
		});

		it("Should send a require for a transaction that has been submitted", async () => {});
	});

	describe("Reject transaction Tests", () => {
		beforeEach(async () => {
			await multisig.newTransaction(owners[0], 100000, "0x");
		});

		it("Should emit RejectTransaction for a valid confirmTransaction call", async () => {
			await expect(
				multisig.connect(signers[1]).rejectTransaction(0)
			).to.emit(multisig, "RejectTransaction");
		});

		it("Should have add a new reject and the rejections should be at 1", async () => {
			await multisig.connect(signers[1]).rejectTransaction(0);
			const x = await multisig.getTransactions();
			expect(await x[0].rejections).to.equal(1);
		});

		it("Should emit RejectTransaction if owners.length - transactions[transactionIndex].rejections < numberOfConfirmations", async () => {
			for (let i = 1; i < 5; i++) {
				await multisig.connect(signers[i]).rejectTransaction(0);
			}

			await expect(
				multisig.connect(signers[6]).rejectTransaction(0)
			).to.emit(multisig, "TransactionRejected");
		});

		it("Should send a require for onlyOwners when a nonOwner calls the function", async () => {
			await expect(
				multisig.connect(signers[11]).rejectTransaction(0)
			).to.be.revertedWith("Not an owner");
		});

		it("Should send a require for transactionExists when a transaction index is sent for a transaction that doesn't exist", async () => {
			await expect(
				multisig.connect(signers[6]).rejectTransaction(1)
			).to.be.revertedWith("Transaction does not exist");
		});

		it("Should send a require for a transaction that has been rejected", async () => {
			for (let i = 1; i < 6; i++) {
				await multisig.connect(signers[i]).rejectTransaction(0);
			}

			await expect(
				multisig.connect(signers[6]).rejectTransaction(0)
			).to.be.revertedWith("Already rejected");
		});
	});
});
