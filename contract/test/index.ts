/* eslint-disable dot-notation */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { assert } from "console";
import { BigNumber, BigNumberish } from "ethers";
import { BN } from "bn.js";

import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { VdtToken } from "../typechain";

describe("Token contract", function () {
  let token: VdtToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2;
  let addrs;
  const initialSupply = 100000;
  const name = "VDT Token";
  const symbol = "VDT";
  const cap = new BN(1000000000).mul(new BN(10).pow(new BN(18)));
  before(async function () {
    const Token = await ethers.getContractFactory("VdtToken");
    // token = await VdtToken.new(initialHolder, initialSupply);
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // token = await Token.deploy(owner.address, initialSupply);
    token = Token.attach("0x6cFB52926Feca2A20ac565559F3f455cB35ee5d7");
    console.log("cap", cap.toString());
  });
  // beforeEach(async function () {
  //   const Token = await ethers.getContractFactory("VdtToken");
  //   // token = await VdtToken.new(initialHolder, initialSupply);
  //   [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  //   // token = await Token.deploy(owner.address, initialSupply);
  //   token = Token.attach("0x6cFB52926Feca2A20ac565559F3f455cB35ee5d7");
  //   console.log("cap",cap)
  // });

  // Kiểm tra tổng số token khởi tạo
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });

  // Kiểm tra tên token
  it("Has a name", async function () {
    expect(await token.name()).to.equal(name);
  });

  // Kiểm tra biểu tượng token
  it("Has a symbol", async function () {
    expect(await token.symbol()).to.equal(symbol);
  });

  // Hiển thị địa chỉ smart contract
  it("Contract address", async () => {
    console.log("Contract address", token.address);
  });

  // Kiểm tra địa chỉ của owner
  it("holder tokens", async () => {
    console.log("holder tokens", await token.balanceOf(owner.address));
  });

  it("big numbers should be equal", async function () {
    const total = await token.totalSupply();

    console.log("total->", total);
    // expect(total).to.be.a.b
  });
  it("big numbers should be equal", async function () {
    const decimal = await token.decimals();

    console.log("decimal->", decimal);
    // expect(total).to.be.a.b
  });

  describe("Test mint and burn function", async () => {
    it("burn token", async () => {
      const totalSupplyBefore = await token.totalSupply();
      const burnFromAddress = owner.address;
      const burnAddressBlanceBefore = await token.balanceOf(burnFromAddress);
      const burnAmount = 1000;
      // burn token from address
      await token["burn(address,uint256)"](burnFromAddress, burnAmount);
      const totalSupplyAfter = await token.totalSupply();
      const burnAddressBlanceAfter = await token.balanceOf(burnFromAddress);
      console.log("Total supply", await token.totalSupply());
      expect(totalSupplyBefore.sub(burnAmount)).to.equal(totalSupplyAfter);
      expect(burnAddressBlanceBefore.sub(burnAmount)).to.equal(
        burnAddressBlanceAfter
      );
    });

    it("mint token", async () => {
      const totalSupplyBefore = await token.totalSupply();
      const mintToAddress = owner.address;
      const mintAddressBlanceBefore = await token.balanceOf(mintToAddress);
      const mintAmount = 1000;
      // mint token to address
      await token["mint"](mintToAddress, mintAmount);
      const totalSupplyAfter = await token.totalSupply();
      const mintAddressBlanceAfter = await token.balanceOf(mintToAddress);
      console.log("Total supply", await token.totalSupply());
      expect(totalSupplyBefore.add(mintAmount)).to.equal(totalSupplyAfter);
      expect(mintAddressBlanceBefore.add(mintAmount)).to.equal(
        mintAddressBlanceAfter
      );
    });
  });

  describe("Test all basic token functions", async () => {
    // it("Test contract initiated values", async function () {
    //   const expectedTotalSupply = 100000; // 24 ~ 1M 10^6 & 10^18 decimals
    //   expect(await token.totalSupply()).to.equal(expectedTotalSupply);
    // });
    // it(`Test token burn`, async () => {
    //   const adminBalance: BigNumberish = await token.balanceOf(owner.address);
    //   const burnAmount = 100;
    //   const totalSupply = await token.totalSupply();
    //   // Expected values
    //   const adminBalanceAfter = adminBalance.sub(burnAmount);
    //   const totalSupplyAfter = totalSupply.sub(burnAmount);
    //   await token.burn(burnAmount, { from: owner.address }); // Đốt token
    //   console.log(
    //     `totalSupply: ${await token.totalSupply()} ${totalSupplyAfter} | afterBurn: ${burnAmount}`
    //   );
    //   expect(await token.balanceOf(owner.address)).to.equal(adminBalanceAfter);
    //   expect(await token.totalSupply()).to.equal(totalSupplyAfter);
    // });
    // it(`Test token burnFrom`, async () => {
    //   const adminBalance = await token.balanceOf(owner.address);
    //   const userBalance = await token.balanceOf(addr1.address);
    //   const totalSupply = await token.totalSupply();
    //   const burnAmount = 500;
    //   // Expected values
    //   const adminBalanceAfter = adminBalance.sub(burnAmount);
    //   const totalSupplyAfter = totalSupply.sub(burnAmount);
    //   await token.approve(addr1.address, burnAmount, { from: owner.address });
    //   await token.burnFrom(owner.address, burnAmount, { from: addr1.address });
    //   console.log(
    //     `totalSupply: ${await token.totalSupply()} ${totalSupplyAfter} | afterBurn: ${burnAmount}`
    //   );
    //   console.log(
    //     `adminBalance: ${await token.balanceOf(
    //       owner.address
    //     )} ${adminBalanceAfter} | afterBurn: ${burnAmount}`
    //   );
    //   console.log(
    //     `userBalance: ${await token.balanceOf(
    //       addr1.address
    //     )} ${userBalance} | afterBurn: ${burnAmount}`
    //   );
    //   expect(await token.balanceOf(owner.address)).to.equal(adminBalanceAfter);
    //   expect(await token.balanceOf(addr1.address)).to.equal(
    //     userBalance.sub(burnAmount)
    //   );
    //   expect(await token.totalSupply()).to.equal(totalSupplyAfter);
    // });
  });
});
