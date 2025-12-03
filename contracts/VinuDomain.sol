// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VinuDomain is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant REGISTRATION_FEE_SHORT = 20000 ether;
    uint256 public constant REGISTRATION_FEE_LONG = 10000 ether;
    uint256 public constant REGISTRATION_PERIOD = 365 days;

    mapping(string => uint256) public nameToTokenId;
    mapping(string => uint256) public nameToExpiry;
    mapping(string => string) public nameToContent;
    mapping(uint256 => uint256) public tokenIdToPrice;

    event DomainRegistered(uint256 indexed tokenId, string name, address owner);
    event DomainListed(uint256 indexed tokenId, uint256 price);
    event DomainSold(uint256 indexed tokenId, address indexed buyer, uint256 price);

    constructor() ERC721("VinuDomain", "VINU") {}

    function register(string memory name) public payable {
        require(bytes(name).length > 0, "Empty name");
        require(nameToTokenId[name] == 0 || nameToExpiry[name] < block.timestamp, "Taken");

        uint256 fee = bytes(name).length <= 5 ? REGISTRATION_FEE_SHORT : REGISTRATION_FEE_LONG;
        require(msg.value >= fee, "Insufficient fee");

        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(msg.sender, id);

        nameToTokenId[name] = id;
        nameToExpiry[name] = block.timestamp + REGISTRATION_PERIOD;
        emit DomainRegistered(id, name, msg.sender);

        if (msg.value > fee) payable(msg.sender).transfer(msg.value - fee);
    }

    function renew(string memory name) public payable {
        require(nameToTokenId[name] != 0, "Not registered");
        uint256 fee = bytes(name).length <= 5 ? REGISTRATION_FEE_SHORT : REGISTRATION_FEE_LONG;
        require(msg.value >= fee, "Insufficient fee");
        nameToExpiry[name] = block.timestamp + REGISTRATION_PERIOD;
        if (msg.value > fee) payable(msg.sender).transfer(msg.value - fee);
    }

    function setAddress(string memory name, address newAddr) public {
        uint256 tokenId = nameToTokenId[name];
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _transfer(msg.sender, newAddr, tokenId);
    }

    function setContent(string memory name, string memory content) public {
        uint256 tokenId = nameToTokenId[name];
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        nameToContent[name] = content;
    }

    function listForSale(string memory name, uint256 price) public {
        uint256 tokenId = nameToTokenId[name];
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        tokenIdToPrice[tokenId] = price;
        emit DomainListed(tokenId, price);
    }

    function buyDomain(string memory name) public payable {
        uint256 tokenId = nameToTokenId[name];
        uint256 price = tokenIdToPrice[tokenId];
        require(price > 0, "Not for sale");
        require(msg.value >= price, "Low payment");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);
        tokenIdToPrice[tokenId] = 0;
        emit DomainSold(tokenId, msg.sender, msg.value);
    }

    function transferWithDomain(string memory domain, uint256 amount) public payable {
        string memory name = _stripVc(domain);
        uint256 tokenId = nameToTokenId[name];

        require(tokenId != 0, "Domain does not exist");
        require(ownerOf(tokenId) == msg.sender, "You do not own this domain"); // OWNERSHIP CHECK
        require(msg.value >= amount, "Insufficient VC sent");

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit DomainSold(tokenId, msg.sender, amount);
    }

    function _stripVc(string memory domain) internal pure returns (string memory) {
        bytes memory b = bytes(domain);
        if (b.length < 4) return domain;
        if (b[b.length-3] == "." && b[b.length-2] == "v" && b[b.length-1] == "c") {
            bytes memory trimmed = new bytes(b.length - 3);
            for (uint i = 0; i < b.length - 3; i++) trimmed[i] = b[i];
            return string(trimmed);
        }
        return domain;
    }

    function nameToExpiry(string memory name) public view returns (uint256) { return nameToExpiry[name]; }
    function tokenIdToPrice(uint256 tokenId) public view returns (uint256) { return tokenIdToPrice[tokenId]; }
    function nameToContent(string memory name) public view returns (string memory) { return nameToContent[name]; }
}
