import { expect } from "chai";
import { ethers } from "hardhat";

describe("Escrow", function () {
  let escrow: any;
  let owner: any;
  let investor: any;
  let fundraiser: any;

  beforeEach(async function () {
    [owner, investor, fundraiser] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  it("Should create an escrow", async function () {
    const amount = ethers.parseEther("1.0");
    const releaseConditions = "Project completion";

    const tx = await escrow.connect(investor).createEscrow(
      fundraiser.address,
      releaseConditions,
      { value: amount }
    );

    await expect(tx)
      .to.emit(escrow, "EscrowCreated")
      .withArgs(ethers.anyValue, investor.address, fundraiser.address, amount);
  });

  it("Should activate escrow when both parties approve", async function () {
    const amount = ethers.parseEther("1.0");
    const releaseConditions = "Project completion";

    const createTx = await escrow.connect(investor).createEscrow(
      fundraiser.address,
      releaseConditions,
      { value: amount }
    );

    const receipt = await createTx.wait();
    const escrowId = receipt.logs[0].args[0];

    await escrow.connect(investor).activateEscrow(escrowId);
    await escrow.connect(fundraiser).activateEscrow(escrowId);

    const escrowDetails = await escrow.getEscrow(escrowId);
    expect(escrowDetails.status).to.equal(1); // ACTIVE
  });
});


