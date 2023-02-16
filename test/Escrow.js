const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let realEstate, escrow;
    let seller, buyer, inspector, lender;
    let transaction;

    beforeEach(async()  => {
        // Get all the addresses required
        [buyer, seller, inspector, lender] = await ethers.getSigners();

        // Deploy the real estate smart contract
        const RealEstate = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstate.deploy();
        
        // Mint 
        transaction = await realEstate.connect(seller)
            .mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
        await transaction.wait();

        // Deploy escrow
        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(realEstate.address, seller.address, inspector.address, lender.address);
    
        // Approve property
        transaction = await realEstate.connect(seller).approve(escrow.address, 1);
        await transaction.wait();

        // List property
        transaction = await escrow.connect(seller).list(1, buyer.address,
                tokens(10), tokens(5));
        await transaction.wait();
    }) 

    describe('Deployment',  () => {
        it('returns NFT address', async() => {
            const result = await escrow.nftAddress();
            expect(result).to.equal(realEstate.address);
        })
        it('returns seller', async() => {
            const result = await escrow.seller();
            expect(result).to.equal(seller.address);
         })
         it('returns inspector', async() => {
            const result = await escrow.inspector();
            expect(result).to.equal(inspector.address);
         })
         it('returns lender', async() => {
            const result = await escrow.lender();
            expect(result).to.equal(lender.address);
         })  
    })
    describe('Listing', () => {
        describe('Success', () => {
            it('updates as listed', async() => {
                expect(await escrow.isListed(1)).to.equal(true);
            })
            it('updates ownership', async() => {
                expect(await realEstate.ownerOf(1)).to.equal(escrow.address);
            })
            it ('returns buyer', async() => {
                expect(await escrow.buyer(1)).to.equal(buyer.address);
            })
            it('returns purchase price', async() => {
                expect(await escrow.purchasePrice(1)).to.equal(tokens(10));
            })
            it('returns escrow amount', async() => {
                expect(await escrow.escrowAmount(1)).to.equal(tokens(5));
            })
        })
        describe('Failure', () => {
            it('rejects anyone other than the seller', async() => {
                await expect(escrow.connect(buyer).list(1, buyer.address, tokens(10), tokens(5)))
                    .to.be.reverted;
            })
        })
        
    })
})
