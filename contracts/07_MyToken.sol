// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    // Constructor supply is whole tokens; transfer values are base units.
    constructor(string memory _n, string memory _s, uint256 _supply) {
        name = _n;
        symbol = _s;
        totalSupply = _supply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0), "Zero spender");
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        allowance[from][msg.sender] -= value;
        emit Approval(from, msg.sender, allowance[from][msg.sender]);
        _transfer(from, to, value);
        return true;
    }
    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0) && to != address(0), "Zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}
