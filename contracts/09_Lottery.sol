// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Lottery {
    address payable[] private players;
    address public manager;
    uint256 public entryFee;
    uint256 public minPlayers;
    bool private selecting;
    event Entered(address indexed player);
    event WinnerSelected(address indexed winner, uint256 amount);
    modifier onlyManager() {
        require(msg.sender == manager, "Not manager");
        _;
    }
    constructor(uint256 _entryFee, uint256 _minPlayers) {
        require(_entryFee > 0 && _minPlayers > 0, "Invalid settings");
        manager = msg.sender;
        entryFee = _entryFee;
        minPlayers = _minPlayers;
    }
    function enter() public payable {
        require(!selecting, "Round settling");
        require(msg.sender != manager, "Manager cannot enter");
        require(msg.value == entryFee, "Wrong entry fee");
        players.push(payable(msg.sender));
        emit Entered(msg.sender);
    }
    function playersCount() public view returns (uint256) {
        return players.length;
    }
    // Educational pseudo-randomness, predictable and manipulable.
    function pickWinner() public onlyManager {
        require(!selecting, "Round settling");
        require(players.length >= minPlayers, "Too few players");
        selecting = true;
        address payable winner = players[
            uint256(blockhash(block.number - 1)) % players.length
        ];
        uint256 amount = address(this).balance;
        delete players;
        emit WinnerSelected(winner, amount);
        (bool success, ) = winner.call{value: amount}("");
        require(success, "Transfer failed");
        selecting = false;
    }
}
