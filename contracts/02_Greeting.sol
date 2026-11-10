// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Greeting {
    string private greeting;
    address public owner;
    event GreetingChanged(address changer, string newGreeting);
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    constructor(string memory _g) {
        owner = msg.sender;
        greeting = _g;
    }
    function setGreeting(string memory _g) public onlyOwner {
        greeting = _g;
        emit GreetingChanged(msg.sender, _g);
    }
    function greet() public view returns (string memory) {
        return greeting;
    }
    function resetGreeting() public onlyOwner {
        setGreeting("Hello, World!");
    }
}
