// SPDX-Lincense-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
    constructor(uint256 initialSuply) ERC20("OurToken", "OTK") {
        _mint(msg.sender, initialSuply * 10 ** decimals());
    }
}