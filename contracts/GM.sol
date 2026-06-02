// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GM - A simple on-chain Good Morning contract
/// @notice Anyone can say "GM" and it gets recorded forever on-chain
contract GM {
    // Stores how many times each address has said GM
    mapping(address => uint256) public gmCount;

    // Stores the last time each address said GM (Unix timestamp)
    mapping(address => uint256) public lastGM;

    // Total GMs said by everyone
    uint256 public totalGMs;

    // The most recent GM sender
    address public lastGMSender;

    // Event fired when someone says GM
    event GoodMorning(address indexed sender, uint256 count, uint256 timestamp);

    /// @notice Say GM on-chain!
    function sayGM() external {
        gmCount[msg.sender] += 1;
        lastGM[msg.sender] = block.timestamp;
        totalGMs += 1;
        lastGMSender = msg.sender;

        emit GoodMorning(msg.sender, gmCount[msg.sender], block.timestamp);
    }

    /// @notice Get GM stats for any address
    function getStats(address user) external view returns (uint256 count, uint256 last) {
        return (gmCount[user], lastGM[user]);
    }
}
