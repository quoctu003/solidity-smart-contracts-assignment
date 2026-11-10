// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleBank {
    mapping(address => uint256) private balances;
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    function deposit() public payable {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    function withdraw(uint256 amount) public {
        require(
            amount > 0 && balances[msg.sender] >= amount,
            "Invalid withdrawal"
        );
        // Effects precede the external interaction.
        balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
    function myBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    function bankTotal() public view returns (uint256) {
        return address(this).balance;
    }
}
