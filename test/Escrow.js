const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let realEstate;

    beforeEach(async()  => {
        //Deploy the real estate smart contract
        const RealEstate = await ethers.getContractFactory('Real Estate');
        realEstate = await RealEstate.deploy();
    }) 
    it('saves the addresses', async() => {

    })
})
