// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
Details of the project:
We are making a multi signature wallet that is supposed to 
Have multiple addresses associated with the smart contract
Each address can submit a new transaction
Each pending transaction has to be approved by the majority of the addresses
Each address can reject or approve a pending transaction
Each address can execute a transaction that is approved

*/

contract Multsig {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numberOfConfirmations;
    struct Transaction {
        address to;
        //This the person who created the transaction, this can be important when the transaction is rejected and we need to return
        //the money they sent
        address from;
        uint256 value;
        bytes data; //This would contain the information such as calling a function so that we can execute it
        uint256 confirmations;
        uint256 rejections;
        bool executed;
    }
    Transaction[] public transactions;
    //When someone confirms a transaction
    event ConfirmTransaction(
        address indexed sender,
        uint256 indexed transactionIndex,
        uint256 confirmations
    );
    //When someone rejects a transaction
    event RejectTransaction(
        address indexed sender,
        uint256 indexed transactionIndex,
        uint256 rejections
    );
    //When someone creates a new transaction by default the confirmations number would increase by one
    event NewTransaction(
        address indexed sender,
        uint256 indexed transactionIndex
    );
    //This would signal if the transaction is ready to be submitted by confirmations == numberOfConfirmations
    event SubmitTransaction(
        address indexed sender,
        uint256 indexed transactionIndex
    );
    //When a transaction is submitted you send this event to now that the transaction has already been submitted
    event TransactionSubmitted(
        address indexed sender,
        uint256 indexed transactionIndex
    );
    /*When a transaction has enough rejections that it can't be submitted
        ex. 4 confirmations are needed and 5 owners exist
        so if 2 people reject than this transaction is rejected

        *If the transaction is re
    */
    event TransactionRejected(
        address indexed sender,
        uint256 indexed transactionIndex
    );

    constructor(address[] memory _owners, uint256 _numberofConfirmations) {
        owners = _owners;
        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }

        numberOfConfirmations = _numberofConfirmations;
    }

    //Functions
    //This creates a new transaction
    function newTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public payable ownersOnly {
        Transaction memory createdTransaction;
        createdTransaction.to = _to;
        createdTransaction.from = msg.sender;
        createdTransaction.value = _value;
        createdTransaction.data = _data;
        createdTransaction.confirmations = 1;
        createdTransaction.rejections = 0;
        createdTransaction.executed = false;

        transactions.push(createdTransaction);

        emit NewTransaction(msg.sender, transactions.length - 1);
        if (createdTransaction.confirmations == numberOfConfirmations) {
            emit SubmitTransaction(msg.sender, transactions.length - 1);
        }
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }

    //Modifiers
    modifier ownersOnly() {
        require(isOwner[msg.sender] == true, "Not an owner");
        _;
    }
}
