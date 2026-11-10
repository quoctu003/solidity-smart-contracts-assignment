// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EnglishAuction {
    address payable public seller;
    uint256 public auctionEnd;
    address public highestBidder;
    uint256 public highestBid;
    uint256 public constant MIN_INCREMENT = 5;
    mapping(address => uint256) public pendingReturns;
    bool public ended;
    event NewBid(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event PendingWithdrawn(address indexed bidder, uint256 amount);
    constructor(uint256 _biddingSeconds, uint256 _startPrice) {
        require(_biddingSeconds > 0 && _startPrice > 0, "Invalid auction");
        seller = payable(msg.sender);
        auctionEnd = block.timestamp + _biddingSeconds;
        highestBid = _startPrice;
    }
    function bid() external payable {
        require(!ended && block.timestamp < auctionEnd, "Auction ended");
        // Round the 5% increment upward so very small bids still increase.
        uint256 increment = highestBid / 20;
        if (highestBid % 20 != 0) {
            increment++;
        }
        require(msg.value >= highestBid + increment, "Bid too low");
        if (highestBidder != address(0)) {
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit NewBid(msg.sender, msg.value);
    }
    function withdrawPending() external returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No pending refund");
        pendingReturns[msg.sender] = 0;
        emit PendingWithdrawn(msg.sender, amount);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        return true;
    }
    function endAuction() external {
        require(block.timestamp >= auctionEnd, "Auction active");
        require(!ended, "Already ended");
        ended = true;
        if (highestBidder == address(0)) {
            emit AuctionEnded(address(0), 0);
            return;
        }
        emit AuctionEnded(highestBidder, highestBid);
        (bool success, ) = seller.call{value: highestBid}("");
        require(success, "Transfer failed");
    }
}
