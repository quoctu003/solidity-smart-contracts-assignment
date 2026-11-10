// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MultisigWallet {
    address[] public owners;
    uint256 public required;
    mapping(address => bool) public isOwner;
    struct Transaction {
        address to;
        uint256 value;
        bool executed;
    }
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmed;
    mapping(uint256 => uint256) private confirmationCounts;
    event Submission(uint256 indexed txId);
    event Confirmation(address indexed owner, uint256 indexed txId);
    event Execution(uint256 indexed txId);
    event Deposit(address indexed sender, uint256 amount);
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    modifier pending(uint256 txId) {
        require(txId < transactions.length, "Invalid transaction");
        require(!transactions[txId].executed, "Already executed");
        _;
    }
    constructor(address[] memory _owners, uint256 _required) {
        require(
            _required > 0 && _required <= _owners.length,
            "Invalid threshold"
        );
        required = _required;
        for (uint256 i; i < _owners.length; i++) {
            address candidate = _owners[i];
            require(
                candidate != address(0) && !isOwner[candidate],
                "Invalid owner"
            );
            isOwner[candidate] = true;
            owners.push(candidate);
        }
    }
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
    // Submission includes the submitter's first confirmation.
    function submitTransaction(address to, uint256 value) external onlyOwner {
        require(to != address(0) && value > 0, "Invalid transfer");
        uint256 txId = transactions.length;
        transactions.push(Transaction(to, value, false));
        emit Submission(txId);
        _confirm(txId);
    }
    function confirmTransaction(uint256 txId) external onlyOwner pending(txId) {
        _confirm(txId);
    }
    function _confirm(uint256 txId) internal {
        require(!confirmed[txId][msg.sender], "Already confirmed");
        confirmed[txId][msg.sender] = true;
        confirmationCounts[txId]++;
        emit Confirmation(msg.sender, txId);
        if (confirmationCounts[txId] == required) {
            executeTransaction(txId);
        }
    }
    function executeTransaction(uint256 txId) public onlyOwner pending(txId) {
        require(
            confirmationCounts[txId] >= required,
            "Insufficient confirmations"
        );
        Transaction storage transaction = transactions[txId];
        require(
            address(this).balance >= transaction.value,
            "Insufficient funds"
        );
        transaction.executed = true;
        emit Execution(txId);
        (bool success, ) = payable(transaction.to).call{
            value: transaction.value
        }("");
        require(success, "Transfer failed");
    }
    function getConfirmations(uint256 txId) external view returns (uint256) {
        require(txId < transactions.length, "Invalid transaction");
        return confirmationCounts[txId];
    }
}
