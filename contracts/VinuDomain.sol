// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VinuDomain is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant REGISTRATION_FEE_SHORT = 20000 ether; // ≤5 letters
    uint256 public constant REGISTRATION_FEE_LONG = 10000 ether;  // >5 letters
    uint256 public constant REGISTRATION_PERIOD = 365 days;

    mapping(string => uint256) public nameToTokenId;
    mapping(string => uint256) public nameToExpiry;
    mapping(string => string) public nameToContent;
    mapping(uint256 => uint256) public tokenIdToPrice;

    event DomainRegistered(uint256 indexed tokenId, string name, address owner);
    event DomainListed(uint256 indexed tokenId, uint256 price);
    event DomainSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor() ERC721("VinuDomain", "VINU") {}

    function register(string memory name) public payable {
        require(nameToTokenId[name] == 0 || nameToExpiry[name] < block.timestamp, "Domain taken or not expired");
        uint256 fee = bytes(name).length <= 5 ? REGISTRATION_FEE_SHORT : REGISTRATION_FEE_LONG;
        require(msg.value >= fee, "Insufficient fee");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        nameToTokenId[name] = newTokenId;
        nameToExpiry[name] = block.timestamp + REGISTRATION_PERIOD;
        emit DomainRegistered(newTokenId, name, msg.sender);

        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }

    function renew(string memory name) public payable {
        require(nameToTokenId[name] != 0, "Domain not registered");
        uint256 fee = bytes(name).length <= 5 ? REGISTRATION_FEE_SHORT : REGISTRATION_FEE_LONG;
        require(msg.value >= fee, "Insufficient fee");
        nameToExpiry[name] = block.timestamp + REGISTRATION_PERIOD;

        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }

    function setAddress(string memory name, address newAddr) public {
        require(ownerOf(nameToTokenId[name]) == msg.sender, "Not owner");
        _transfer(msg.sender, newAddr, nameToTokenId[name]);
    }

    function setContent(string memory name, string memory content) public {
        require(ownerOf(nameToTokenId[name]) == msg.sender, "Not owner");
        nameToContent[name] = content;
    }

    function createSubdomain(string memory parent, string memory sub, address subAddr) public {
        require(ownerOf(nameToTokenId[parent]) == msg.sender, "Not owner");
        // Subdomain logic (simplified for example)
    }

    function listForSale(string memory name, uint256 price) public {
        uint256 tokenId = nameToTokenId[name];
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        tokenIdToPrice[tokenId] = price;
        emit DomainListed(tokenId, price);
    }

    function buyDomain(string memory name) public payable {
        uint256 tokenId = nameToTokenId[name];
        require(tokenIdToPrice[tokenId] > 0, "Not for sale");
        require(msg.value >= tokenIdToPrice[tokenId], "Insufficient payment");
        address owner = ownerOf(tokenId);
        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
        tokenIdToPrice[tokenId] = 0;
        emit DomainSold(tokenId, msg.sender, msg.value);
    }

    function transferWithDomain(string memory domain, uint256 amount) public payable {
        uint256 tokenId = nameToTokenId[domain];
        require(msg.value >= amount, "Insufficient amount");
        address recipient = ownerOf(tokenId);
        payable(recipient).transfer(amount);
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        return super.ownerOf(tokenId);
    }

    function balanceOf(address owner) public view override returns (uint256) {
        return super.balanceOf(owner);
    }

    function nameToExpiry(string memory name) public view returns (uint256) {
        return nameToExpiry[name];
    }

    function tokenIdToPrice(uint256 tokenId) public view returns (uint256) {
        return tokenIdToPrice[tokenId];
    }

    function nameToContent(string memory name) public view returns (string memory) {
        return nameToContent[name];
    }
}
