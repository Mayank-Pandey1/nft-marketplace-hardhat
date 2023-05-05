const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Unit tests", () => {
          let nftMarketplace,
              nftMarketplaceContract,
              basicNft,
              basicNftContract;
          const PRICE = ethers.utils.parseEther("0.1");
          const TOKEN_ID = 0;
          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              user = accounts[1]; //one extra user required in tests below
              await deployments.fixture(["all"]);
              nftMarketplaceContract = await ethers.getContract(
                  "NftMarketplace"
              );
              nftMarketplace = nftMarketplaceContract.connect(deployer);
              basicNftContract = await ethers.getContract("BasicNft");
              basicNft = basicNftContract.connect(deployer);
              await basicNft.mintNFT();
              await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
          });

          describe("listItem", () => {
              it("emits event after listing an item", async () => {
                  expect(
                      await nftMarketplace.listItem(
                          basicNft.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("ItemListed");
              });
              it("Throws error if Item is already listed", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(
                      `NftMarketplace__AlreadyListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });
              it("only allows owners to list an NFT", async () => {
                  nftMarketplace = nftMarketplaceContract.connect(user); //now some other user is viewing the marketplace
                  await basicNft.approve(user.address, TOKEN_ID);
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotOwner");
              });
              it("needs approvals to list item", async () => {
                  await basicNft.approve(
                      ethers.constants.AddressZero,
                      TOKEN_ID
                  );
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(
                      "NftMarketplace__NotApprovedForMarketplace"
                  );
              });
              it("Updates listing with seller and price", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert(listing.price.toString() == PRICE.toString());
                  assert(listing.seller.toString() == deployer.address);
              });
              it("reverts if the price is 0", async () => {
                  const ZERO_PRICE = ethers.utils.parseEther("0");
                  await expect(
                      nftMarketplace.listItem(
                          basicNft.address,
                          TOKEN_ID,
                          ZERO_PRICE
                      )
                  ).revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__PriceNotGreaterThanZero"
                  );
              });
          });
          describe("buyItem", () => {
              it("throws error if item is not listed", async () => {
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });
              it("reverts if price is not met", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__PriceNotMet("${basicNft.address}",${TOKEN_ID},${PRICE})`
                  );
              });
              it("Updates internal proceeds and nft is transferred to buyer", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  nftMarketplace = nftMarketplaceContract.connect(user); //now some other user is viewing the marketplace
                  expect(
                      await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: PRICE,
                      })
                  ).to.emit("ItemBought");
                  const newOwner = await basicNft.ownerOf(TOKEN_ID);
                  const proceeds = await nftMarketplace.getProceeds(
                      deployer.address
                  );
                  assert(newOwner.toString() == user.address);
                  assert(proceeds.toString() == PRICE.toString());
              });
          });
          describe("cancelListing", () => {
              it("throws error if item is not listed", async () => {
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });
              it("throws error if canceller is not the owner", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await basicNft.approve(user.address, TOKEN_ID);
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NftMarketplace__NotOwner");
              });
              it("Update the proceeds and emits event", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  expect(
                      await nftMarketplace.cancelListing(
                          basicNft.address,
                          TOKEN_ID
                      )
                  ).to.emit("ItemCancelled");
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert(listing.price.toString() == "0");
              });
          });
          describe("updateListing", () => {
              it("throws error if item is not listed", async () => {
                  await expect(
                      nftMarketplace.updateListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });
              it("throws error if updater is not the owner", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await basicNft.approve(user.address, TOKEN_ID);
                  await expect(
                      nftMarketplace.updateListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NftMarketplace__NotOwner");
              });
              it("Updates the proceeds and emits an event", async () => {
                  const newPrice = ethers.utils.parseEther("0.2");
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  expect(
                      await nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          newPrice
                      )
                  ).to.emit("ItemListed");
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert(listing.price.toString() == newPrice.toString());
              });
          });
          describe("withdrawProceeds", () => {
              it("Throws error if no proceeds are present", async () => {
                  await expect(
                      nftMarketplace.withdrawProceeds()
                  ).to.be.revertedWith("NftMarketplace__NoProceeds");
              });
              it("Withdraws proceeds successfully", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: PRICE,
                  });
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  const deployerProceedsBefore =
                      await nftMarketplace.getProceeds(deployer.address);
                  const deployerBalanceBefore = await deployer.getBalance();
                  const txResponse = await nftMarketplace.withdrawProceeds();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const deployerBalanceAfter = await deployer.getBalance();

                  assert(
                      deployerBalanceAfter.add(gasCost).toString() ==
                          deployerProceedsBefore
                              .add(deployerBalanceBefore)
                              .toString()
                  );
              });
          });
      });
