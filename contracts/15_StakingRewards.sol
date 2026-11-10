// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StakingRewards {
    address payable public owner;
    // Wei reward per whole ETH staked per second.
    uint256 public rewardRatePerSecond;
    uint256 public totalStaked;
    uint256 public rewardPool;
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
    }
    mapping(address => Stake) public stakes;
    // Global integral preserves rewards across rate changes without looping users.
    uint256 private accumulatedRate;
    uint256 private lastUpdate;
    mapping(address => uint256) private userRateSnapshot;
    mapping(address => uint256) private rewardRemainder;
    bool private entered;
    event Staked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event Unstaked(address indexed user, uint256 principal, uint256 reward);
    event RewardsFunded(uint256 amount);
    event RewardRateChanged(uint256 rate);
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    modifier nonReentrant() {
        require(!entered, "Reentrant call");
        entered = true;
        _;
        entered = false;
    }
    constructor(uint256 _rate) payable {
        owner = payable(msg.sender);
        rewardRatePerSecond = _rate;
        rewardPool = msg.value;
        lastUpdate = block.timestamp;
        emit RewardsFunded(msg.value);
    }
    function _currentRate() internal view returns (uint256) {
        return
            accumulatedRate +
            rewardRatePerSecond * (block.timestamp - lastUpdate);
    }
    function _checkpoint(address user) internal {
        uint256 current = _currentRate();
        Stake storage position = stakes[user];
        uint256 numerator =
            position.amount * (current - userRateSnapshot[user]) +
                rewardRemainder[user];
        position.rewardDebt += numerator / 1 ether;
        rewardRemainder[user] = numerator % 1 ether;
        userRateSnapshot[user] = current;
        position.startTime = block.timestamp;
    }
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Zero stake");
        _checkpoint(msg.sender);
        stakes[msg.sender].amount += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    function pendingReward(address user) public view returns (uint256) {
        Stake storage position = stakes[user];
        return
            position.rewardDebt +
            (position.amount * (_currentRate() - userRateSnapshot[user]) +
                rewardRemainder[user]) /
                1 ether;
    }
    function unstake() external nonReentrant {
        _checkpoint(msg.sender);
        Stake storage position = stakes[msg.sender];
        uint256 principal = position.amount;
        uint256 reward = position.rewardDebt;
        require(principal > 0, "No stake");
        require(reward <= rewardPool, "Insufficient reward pool");
        totalStaked -= principal;
        rewardPool -= reward;
        delete stakes[msg.sender];
        delete rewardRemainder[msg.sender];
        emit Unstaked(msg.sender, principal, reward);
        _pay(principal + reward);
    }
    function claimReward() external nonReentrant {
        _checkpoint(msg.sender);
        uint256 reward = stakes[msg.sender].rewardDebt;
        require(reward > 0, "No reward");
        require(reward <= rewardPool, "Insufficient reward pool");
        stakes[msg.sender].rewardDebt = 0;
        rewardPool -= reward;
        emit RewardClaimed(msg.sender, reward);
        _pay(reward);
    }
    function fundRewards() external payable onlyOwner {
        require(msg.value > 0, "Zero funding");
        rewardPool += msg.value;
        emit RewardsFunded(msg.value);
    }
    function setRewardRate(uint256 _newRate) external onlyOwner {
        accumulatedRate = _currentRate();
        lastUpdate = block.timestamp;
        rewardRatePerSecond = _newRate;
        emit RewardRateChanged(_newRate);
    }
    function _pay(uint256 amount) internal {
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
}
