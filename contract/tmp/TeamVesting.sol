// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

// Interfaces
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Libraries
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Contracts
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Team Vesting
/// @author Jones DAO
/// @notice Allows to add beneficiaries for token vesting
/// @notice Inspired by witherblock's code
contract TeamVesting is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Token
    IERC20 public token;

    // Structure of each vest
    struct Vest {
        uint256 amount; // the total amount of Token the beneficiary will recieve
        uint256 released; // the amount of Token released to the beneficiary
        uint256 initialReleaseAmount; // the amount of Token released to the beneficiary at the start of the vesting period
        uint256 duration; // duration of the vesting
        uint256 startTime; // start time of the vesting
    }

    // The mapping of vested beneficiary (beneficiary address => Vest)
    mapping(address => Vest) public vestedBeneficiaries;

    // No. of beneficiaries
    uint256 public noOfBeneficiaries;

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Token address cannot be 0");

        token = IERC20(_tokenAddress);
    }

    /*---- EXTERNAL FUNCTIONS FOR OWNER ----*/

    /**
     * @notice Adds a beneficiary to the contract. Only owner can call this.
     * @param _beneficiary the address of the beneficiary
     * @param _amount amount of JONES to be vested for the beneficiary
     * @param _initialReleaseAmount amount of JONES released to the beneficiary at the start of the vesting period
     * @param _duration duration of the vesting
     */
    function addBeneficiary(
        address _beneficiary,
        uint256 _amount,
        uint256 _initialReleaseAmount,
        uint256 _duration,
        uint256 _startTime
    ) public onlyOwner returns (bool) {
        require(_beneficiary != address(0), "Beneficiary cannot be a 0 address");
        require(_amount > 0, "Amount should be larger than 0");
        require(_amount > _initialReleaseAmount, "Amount should be larger than initial release amount");
        require(vestedBeneficiaries[_beneficiary].amount == 0, "Cannot add the same beneficiary again");
        require(_duration > 0, "Duration passed cannot be 0");
        require(_startTime >= block.timestamp, "Start time cannot be before current time");

        vestedBeneficiaries[_beneficiary].startTime = _startTime;
        vestedBeneficiaries[_beneficiary].duration = _duration;
        vestedBeneficiaries[_beneficiary].amount = _amount;
        vestedBeneficiaries[_beneficiary].initialReleaseAmount = _initialReleaseAmount;

        // Transfer amount of tokens to contract
        token.safeTransferFrom(msg.sender, address(this), _amount);

        noOfBeneficiaries = noOfBeneficiaries.add(1);

        emit AddBeneficiary(_beneficiary, _amount, _initialReleaseAmount, _duration, _startTime);

        return true;
    }

    /**
     * @notice Removes a beneficiary from the contract hence ending their vesting. Only owner can call this.
     * @param _beneficiary the address of the beneficiary
     * @return whether beneficiary was removed
     */
    function removeBeneficiary(address _beneficiary) external onlyOwner returns (bool) {
        require(_beneficiary != address(0), "Beneficiary cannot be a 0 address");
        require(vestedBeneficiaries[_beneficiary].amount != 0, "Cannot remove a beneficiary which has not been added");

        if (releasableAmount(_beneficiary) > 0) {
            release(_beneficiary);
        }

        token.safeTransfer(
            msg.sender,
            vestedBeneficiaries[_beneficiary].amount.sub(vestedBeneficiaries[_beneficiary].released)
        );

        vestedBeneficiaries[_beneficiary].startTime = 0;
        vestedBeneficiaries[_beneficiary].duration = 0;
        vestedBeneficiaries[_beneficiary].amount = 0;
        vestedBeneficiaries[_beneficiary].initialReleaseAmount = 0;
        vestedBeneficiaries[_beneficiary].released = 0; // Lượng token đã trả

        noOfBeneficiaries = noOfBeneficiaries.sub(1);

        emit RemoveBeneficiary(_beneficiary);

        return true;
    }

    /*---- EXTERNAL/PUBLIC FUNCTIONS ----*/

    /**
     * @notice Transfers vested tokens to beneficiary.
     * @param beneficiary the beneficiary to release the JONES too
     */
    function release(address beneficiary) public returns (uint256 unreleased) {
        unreleased = releasableAmount(beneficiary); // Tính lượng token chưa trả

        require(unreleased > 0, "No releasable amount");

        vestedBeneficiaries[beneficiary].released = vestedBeneficiaries[beneficiary].released.add(unreleased);

        token.safeTransfer(beneficiary, unreleased);

        emit TokensReleased(beneficiary, unreleased);
    }

    /*---- VIEWS ----*/

    /**
     * @notice Calculates the amount that has already vested but hasn't been released yet.
     * @param beneficiary address of the beneficiary
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        // Tính lượng token được nhận còn lại = Lượng token từ lúc bắt đầu đến hiện tại - Lượng token đã cấp
        return vestedAmount(beneficiary).sub(vestedBeneficiaries[beneficiary].released);
    }

    /**
     * @notice Tính số tiền đã được cấp.
     * @param beneficiary địa chỉ của người thụ hưởng
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        // Tổng số tiền được trợ cấp
        uint256 totalBalance = vestedBeneficiaries[beneficiary].amount;

        if (block.timestamp < vestedBeneficiaries[beneficiary].startTime) {
            // Nếu thời gian hiện tại trên khối nhỏ hơn thời gian bắt đầu trả thì trả về 0
            return 0;
        } else if (
            block.timestamp >= vestedBeneficiaries[beneficiary].startTime.add(vestedBeneficiaries[beneficiary].duration)
        ) {
            // Nếu thời gian hiện tại trên khối lơn hơn thời gian kết thúc (kết thúc = bắt đầu + Khoảng thời gian)
            // Trả về toàn bộ token
            return totalBalance;
        } else {

            // Thơi gian khối đang ở trong 

            uint256 balanceAmount = totalBalance.sub(vestedBeneficiaries[beneficiary].initialReleaseAmount);
            
            // Trả về balanceAmount*(Thời gian hiện tại - Thời gian bắt đầu) / Tổng thời gian + initialReleaseAmount

            return
                balanceAmount
                    .mul(block.timestamp.sub(vestedBeneficiaries[beneficiary].startTime))
                    .div(vestedBeneficiaries[beneficiary].duration)
                    .add(vestedBeneficiaries[beneficiary].initialReleaseAmount);
        }
    }

    /*---- EVENTS ----*/

    event TokensReleased(address beneficiary, uint256 amount);

    event AddBeneficiary(
        address beneficiary,
        uint256 amount,
        uint256 initialReleaseAmount,
        uint256 duration,
        uint256 startTime
    );

    event RemoveBeneficiary(address beneficiary);
}
