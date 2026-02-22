// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title 0G-VOE: AI Model Marketplace (Mainnet)
contract OGVOE is ERC721, Ownable, ReentrancyGuard {
    struct AIModel {
        string name;
        string cid; // 0G Storage CID
        address owner;
        uint256 totalUses;
        bool active;
    }

    uint256 public modelCount;

    mapping(uint256 => AIModel) public models;

    event ModelListed(uint256 indexed id, string name, string cid);
    event ModelUsed(uint256 indexed id, address indexed user);

    constructor() ERC721("0G-VOE Model", "OGM") Ownable(msg.sender) {}

    // === MODEL MARKETPLACE ===
    function listModel(string calldata name, string calldata cid) external {
        require(bytes(name).length > 0 && bytes(cid).length > 0, "Invalid input");
        uint256 id = ++modelCount;
        models[id] = AIModel(name, cid, msg.sender, 0, true);
        _safeMint(msg.sender, id);
        emit ModelListed(id, name, cid);
    }

    function useModel(uint256 modelId) external nonReentrant {
        AIModel storage model = models[modelId];
        require(model.active, "Model inactive");
        model.totalUses++;
        emit ModelUsed(modelId, msg.sender);
    }

    // === ADMIN ===
    function deactivateModel(uint256 modelId) external {
        require(ownerOf(modelId) == msg.sender || msg.sender == owner(), "Unauthorized");
        models[modelId].active = false;
    }
}