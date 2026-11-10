// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleNFT {
    string public name;
    string public symbol;
    address public owner;
    uint256 public nextTokenId;
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public mintPrice = 0.01 ether;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balances;
    mapping(uint256 => address) public approvals;
    event Minted(address indexed to, uint256 indexed tokenId);
    event TransferNFT(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approved(address indexed spender, uint256 indexed tokenId);
    event PaymentsWithdrawn(uint256 amount);
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }
    function mint() external payable returns (uint256) {
        require(msg.value == mintPrice, "Wrong price");
        require(nextTokenId < MAX_SUPPLY, "Sold out");
        uint256 tokenId = nextTokenId++;
        ownerOf[tokenId] = msg.sender;
        balances[msg.sender]++;
        emit Minted(msg.sender, tokenId);
        emit TransferNFT(address(0), msg.sender, tokenId);
        return tokenId;
    }
    function transferNFT(address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == msg.sender, "Not token owner");
        _transfer(msg.sender, to, tokenId);
    }
    function approve(address spender, uint256 tokenId) external {
        require(ownerOf[tokenId] == msg.sender, "Not token owner");
        approvals[tokenId] = spender;
        emit Approved(spender, tokenId);
    }
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(approvals[tokenId] == msg.sender, "Not approved");
        require(ownerOf[tokenId] == from && from != address(0), "Wrong owner");
        _transfer(from, to, tokenId);
    }
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(to != address(0), "Zero recipient");
        delete approvals[tokenId];
        balances[from]--;
        balances[to]++;
        ownerOf[tokenId] = to;
        emit Approved(address(0), tokenId);
        emit TransferNFT(from, to, tokenId);
    }
    function withdrawPayments() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No payments");
        emit PaymentsWithdrawn(amount);
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
    }
}
