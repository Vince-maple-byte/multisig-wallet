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
    public Address[] owners;
    public mapping (address => bool) isOwner;
    public uint256 numberOfConfirmations;
    struct Transaction {
        address to;
        uint256 value;
        bytes data;//This would contain the information such as calling a function so that we can execute it
        uint256 confirmations;
        uint256 rejections;
        bool executed;
    }
    public Transaction[] transactions;

    public Multsig(){
        owners = new uint256[5];
        numberOfConfirmations = 0;
    }

    public Multsig(Address[] _owners){
        owners = _owners;
        for(uint256 i = 0; i < _owners.length; i++){
            isOwner[_owners[i]] = true;
        }

        numberOfConfirmations = _owners.length/2+1;
    }

    public Multsig(Address[] _owners, uint256 _numberofConfirmations){
        owners = _owners;
        for(uint256 i = 0; i < _owners.length; i++){
            isOwner[_owners[i]] = true;
        }

        numberOfConfirmations = _numberofConfirmations;
    }

   
}