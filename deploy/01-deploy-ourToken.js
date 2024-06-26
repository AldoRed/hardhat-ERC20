const { network } = require('hardhat');
const { developmentChains, INITIAL_SUPPLY } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const ourToken = await deploy('OurToken', {
        from: deployer,
        args: [INITIAL_SUPPLY],
        log: true,

        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`OurToken deployed to: ${ourToken.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(ourToken.address, [INITIAL_SUPPLY]);
    }

};

module.exports.tags = ["all", "token"]

