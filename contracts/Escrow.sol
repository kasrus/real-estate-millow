//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress; //address of the real estate 
    address public lender;
    address payable public seller;
    address public inspector;

    mapping(uint => bool) public isListed;
    mapping(uint => uint) public purchasePrice;
    mapping(uint => uint) public escrowAmount;
    mapping(uint => address) public buyer;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyBuyer(uint _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    constructor(address _nftAddress, address payable _seller, 
                address _inspector, address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(uint _nftID, address _buyer, 
        uint _purchasePrice, uint _escrowAmount) public payable onlySeller {
        // Transfer NFT from seller to this smart contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        buyer[_nftID] = _buyer;
        escrowAmount[_nftID] = _escrowAmount;
    }

    // Put under contract (only buyer - payable escrow)
    function depositEarnest(uint _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }
}
