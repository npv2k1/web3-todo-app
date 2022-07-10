// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VNDCToken is ERC20, ERC20Detailed, ERC20Mintable, ERC20Pausable, ERC20Burnable, Ownable {
    // additional variables for use if transaction fees ever became necessary
    uint256 public basisPointsRate = 0;
    uint256 public maximumFee = 0;
    uint256 public minimumFee = 0;
    uint256 public mintingRate = 0;
    mapping(address => bool) public isBlackListed;

    constructor() public ERC20Detailed("VNDC", "VNDC", 0) {
        mint(owner(), 100000000000 * 10**uint256(decimals())); // Initial supply at 100B token
    }

    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        require(!isBlackListed[_to]);
        require(!isBlackListed[msg.sender]);

        uint256 fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        uint256 sendAmount = _value.sub(fee);

        if (fee > 0) {
            super.transfer(owner(), fee);
        }

        return super.transfer(_to, sendAmount);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public whenNotPaused returns (bool) {
        require(!isBlackListed[_from]);
        require(!isBlackListed[_to]);
        require(!isBlackListed[msg.sender]);

        uint256 fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        uint256 sendAmount = _value.sub(fee);

        if (fee > 0) {
            super.transfer(owner(), fee);
            ERC20._approve(_from, _to, sendAmount);
        }

        return super.transferFrom(_from, _to, sendAmount);
    }

    function setParams(
        uint256 newBasisPoints,
        uint256 newMaxFee,
        uint256 newMinFee
    ) public onlyOwner returns (bool) {
        // Ensure transparency by hardcoding limit beyond which fees can never be added
        basisPointsRate = newBasisPoints;
        minimumFee = newMinFee;
        maximumFee = newMaxFee;
        emit Params(basisPointsRate, maximumFee, minimumFee);

        return true;
    }

    function setMintingRate(uint256 newRate) public onlyOwner returns (bool) {
        mintingRate = newRate;
        emit UpdateMintingRate(newRate);

        return true;
    }

    function getBlackListStatus(address _maker) external view returns (bool) {
        return isBlackListed[_maker];
    }

    function addBlackList(address _evilUser) public onlyOwner returns (bool) {
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);

        return true;
    }

    function removeBlackList(address _clearedUser) public onlyOwner returns (bool) {
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);

        return true;
    }

    function destroyBlackFunds(address _blackListedUser) public onlyOwner returns (bool) {
        require(isBlackListed[_blackListedUser]);
        uint256 dirtyFunds = balanceOf(_blackListedUser);
        ERC20._burn(_blackListedUser, dirtyFunds);
        emit DestroyedBlackFunds(_blackListedUser, dirtyFunds);

        return true;
    }

    event DestroyedBlackFunds(address _blackListedUser, uint256 _balance);

    event AddedBlackList(address _user);

    event RemovedBlackList(address _user);

    event Params(uint256 feeBasisPoints, uint256 maxFee, uint256 minFee);

    event UpdateMintingRate(uint256 newMintingRate);
}
