const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, INITIAL_SUPPLY } = require("../../helper-hardhat-config")
const { expect, assert } = require("chai")

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe("OurToken Unit Tests", async () => {
        // Multipler is used to make reading the math easier because of the 18 decimal points
        const multipler = 10 ** 18
        let ourToken, deployer, user1
        beforeEach(async () => {
            const accounts = await getNamedAccounts()
            deployer = accounts.deployer
            user1 = accounts.player

            await deployments.fixture("all")
            ourToken = await ethers.getContract("OurToken", deployer)
        })
        it("was deployed", async () => {
            assert(ourToken.target)
        })
        describe("constructor", async () => {
            it("should have correct INITIAL_SPPLY of token", async () => {
                const totalSupply = await ourToken.totalSupply()
                expect(totalSupply.toString()).to.equal((INITIAL_SUPPLY * multipler).toString())
            })
            it("initializes the token with the correct name and symbol", async () => {
                const name = await ourToken.name()
                const symbol = await ourToken.symbol()
                expect(name).to.equal("OurToken")
                expect(symbol).to.equal("OTK")
            })
        })
        describe("transfers", async () => {
            it("should be able to transfer tokens successfully to an address", async () => {
                const tokensToSend = ethers.parseEther("1")
                await ourToken.transfer(user1, tokensToSend)
                expect(await ourToken.balanceOf(user1)).to.equal(tokensToSend)
            })
            it("emits an transfer event, when an transfer occurs", async () => {
                await expect(ourToken.transfer(user1, ethers.parseEther("1"))).to.emit(ourToken, "Transfer")
            })
        })
        describe("allowances", async () => {
            const amount = (1 * multipler).toString()
            beforeEach(async () => {
                playerToken = await ethers.getContract("OurToken", user1)
            })
            it("should approve other address to spend token", async () => {
                const tokensToSpend = ethers.parseEther("5")
                // Deployer is approving that user1 can spend 5 of their precious tokens
                await ourToken.approve(user1, tokensToSpend)
                await playerToken.transferFrom(deployer, user1, tokensToSpend)
                expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend)
            })
            it("doesn't allow an unnaproved member to do transfers", async () => {
                await expect(playerToken.transferFrom(deployer, user1, amount)).to.be.rejectedWith("ERC20InsufficientAllowance")
            })
            it("emits an approval event, when an approval occurs", async () => {
                await expect(ourToken.approve(user1, amount)).to.emit(ourToken, "Approval")
            })
            it("the allowance being set is accurate", async () => {
                await ourToken.approve(user1, amount)
                expect(await ourToken.allowance(deployer, user1)).to.equal(amount)
            })
            it("won't allow a user to spend more than the approved amount", async () => {
                await ourToken.approve(user1, amount)
                await expect(playerToken.transferFrom(deployer, user1,(2 * multipler).toString())).to.be.rejectedWith("ERC20InsufficientAllowance")
            })
        })
})
