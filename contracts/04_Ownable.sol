// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Ownable {
    address public owner;
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);
    }
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
contract ProtectedVault is Ownable {
    bool private entered;
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    function deposit() public payable {
        require(msg.value > 0, "Zero deposit");
        emit Deposited(msg.sender, msg.value);
    }
    function withdraw(address to, uint256 amt) public onlyOwner {
        require(!entered, "Reentrant call");
        require(to != address(0), "Zero recipient");
        require(amt > 0 && amt <= address(this).balance, "Invalid amount");
        entered = true;
        (bool success, ) = payable(to).call{value: amt}("");
        require(success, "Transfer failed");
        entered = false;
        emit Withdrawn(to, amt);
    }
    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
