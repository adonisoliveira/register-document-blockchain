import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";
import { RegisterDocumentRequest } from "../utils/types";
import { RegisterDocument } from "../typechain-types";

const UPGRADER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));
const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
const NON_EXISTING_ROLE = ethers.keccak256(ethers.toUtf8Bytes("NON_EXISTING_ROLE"));

function createRegisterDocumentRequest() {
  return {
    documentHash: ethers.keccak256(ethers.toUtf8Bytes("File converted to keccak256")),
    document: {
      name: "Test document",
      description: "Test document description",
      signatories: [
        "0xb579Ab9803064fF7eFF7819B0cB4911F843f5361",
        "0x1234567890abcdef1234567890abcdef12345678",
        "0x0badcafe0badcafe0badcafe0badcafe0badcafe",
        "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d"
      ],
      mainDocument: {
        documentHash: ethers.ZeroHash,
        transactionId: ""
      }
    }
  };
}

describe("Deploy and update the RegisterDocument smart contract", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("RegisterDocument");
    const contract = await upgrades.deployProxy(Contract, { initializer: "initialize" });
    const contractAddress = await contract.getAddress();

    return {
      contract,
      contractAddress,
      owner,
      otherAccount
    };
  }

  it("Should allow the owner to authorize an upgrade", async function () {
    const { contractAddress } = await loadFixture(deployFixture);
    const ContractV2 = await ethers.getContractFactory("RegisterDocument");
    
    await expect(upgrades.upgradeProxy(contractAddress, ContractV2)).to.not.be.reverted;
  });

  it("Should not allow non-owner to authorize an upgrade", async function () {
    const { contractAddress, otherAccount } = await loadFixture(deployFixture);
    const ContractV2 = await ethers.getContractFactory("RegisterDocument", otherAccount);

    await expect(upgrades.upgradeProxy(contractAddress, ContractV2)).to.be.reverted;
  });

  it("Should not initialize", async function () {
    const { contract } = await loadFixture(deployFixture);
    
    await expect(contract.initialize()).to.be.reverted;
  });
});

describe("Register document", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("RegisterDocument");
    const contract = await upgrades.deployProxy(Contract, { initializer: "initialize" });
    const contractAddress = await contract.getAddress();
    
    return {
      contract,
      contractAddress,
      owner,
      otherAccount
    };
  }

  let registerDocumentRequest: RegisterDocumentRequest;

  beforeEach(function () {
    registerDocumentRequest = createRegisterDocumentRequest();
  });

  describe("Register document - ERROR SCENARIOS", function () {
    it("With invalid hash", async function () {
      const { contract } = await loadFixture(deployFixture);

      registerDocumentRequest.documentHash = ethers.ZeroHash;

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("The document data was not submitted.");
    });

    it("No name", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      registerDocumentRequest.document.name = "";

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("The document data was not submitted.");
    });

    it("No description", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      registerDocumentRequest.document.description = "";

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("The document data was not submitted.");
    });

    it("No signatories", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      registerDocumentRequest.document.signatories = [];

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("No signatories were provided.");
    });

    it("Repeat signatories", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      registerDocumentRequest.document.signatories.push(registerDocumentRequest.document.signatories[0]);

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("There are repeat signatories to this document.");
    });

    it("Signatory with invalid address", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      registerDocumentRequest.document.signatories = [ethers.ZeroAddress];

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("Invalid signatory.");
    });

    it("Existing document", async function () {
      const { contract } = await loadFixture(deployFixture);

      await contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document);
      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("Unable to save this document.");
    });

    it("Not existing main document", async function () {
      const { contract } = await loadFixture(deployFixture);

      registerDocumentRequest.document.mainDocument.documentHash = registerDocumentRequest.documentHash;

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.revertedWith("Main document not found.");
    });

    it("Requester does not have permission to register", async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      const instanceWithOtherAccount = contract.connect(otherAccount) as RegisterDocument;

      await expect(
        instanceWithOtherAccount.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).to.be.reverted;
    });
  });

  describe("Register document - VALID SCENARIOS", function () {
    it("Document without main document", async function () {
      const { contract } = await loadFixture(deployFixture);

      await expect(
        contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document)
      ).not.be.reverted;
    });

    it("Document with main document", async function () {
      const { contract } = await loadFixture(deployFixture);
      const documentHash = registerDocumentRequest.documentHash;

      await contract.registerDocument(documentHash, registerDocumentRequest.document);

      const newRegisterDocumentRequest = registerDocumentRequest;

      newRegisterDocumentRequest.documentHash = ethers.keccak256(ethers.toUtf8Bytes("New file converted to keccak256"));
      newRegisterDocumentRequest.document.mainDocument.documentHash = documentHash;
      newRegisterDocumentRequest.document.mainDocument.transactionId = "123asd";

      await expect(
        contract.registerDocument(newRegisterDocumentRequest.documentHash, newRegisterDocumentRequest.document)
      ).not.be.reverted;
    });
  });

  describe("Get document - ERROR SCENARIOS", function () {
    it("Search for non-existing document", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      await contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document);
      const result = await contract.findDocumentByHash(ethers.ZeroHash);
      
      expect(result.name).to.equal("");
      expect(result.description).to.equal("");
      expect(result.signatories).to.be.an("array").that.is.empty;
      expect(result.mainDocument.documentHash).to.equal(ethers.ZeroHash);
      expect(result.mainDocument.transactionId).to.equal("");
    });

    it("Try prove ownership with invalid address", async function () {
      const { contract } = await loadFixture(deployFixture);

      await contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document);
      await expect(
        contract.proveOwnership(registerDocumentRequest.documentHash, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid signatory.");
    });

    it("Failure to prove ownership", async function () {
      const { contract } = await loadFixture(deployFixture);
      const signatory = "0xa1b2c3d4e5f67890123456789abcdef012345678";

      await contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document);
      await expect(
        contract.proveOwnership(registerDocumentRequest.documentHash, signatory)
      ).to.be.revertedWith("It was not possible to prove ownership of the document.");
      await expect(
        contract.proveOwnership(ethers.ZeroHash, signatory)
      ).to.be.revertedWith("It was not possible to prove ownership of the document.");
    });

    it("Requester does not have permission to find by hash", async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      const instanceWithOtherAccount = contract.connect(otherAccount) as RegisterDocument;

      await expect(
        instanceWithOtherAccount.findDocumentByHash(registerDocumentRequest.documentHash)
      ).to.be.reverted;
    });
  });

  describe("Get document - VALID SCENARIOS", function () {
    it("Find document by hash", async function () {
      const { contract } = await loadFixture(deployFixture);
      
      await contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document);
      const result = await contract.findDocumentByHash(registerDocumentRequest.documentHash);
      
      expect(result.name).to.equal(registerDocumentRequest.document.name);
      expect(result.description).to.equal(registerDocumentRequest.document.description);
      expect(result.signatories).to.deep.equal(registerDocumentRequest.document.signatories);
      expect(result.mainDocument.documentHash).to.equal(registerDocumentRequest.document.mainDocument.documentHash);
      expect(result.mainDocument.transactionId).to.equal(registerDocumentRequest.document.mainDocument.transactionId);
    });

    it("Prove ownership", async function () {
      const { contract } = await loadFixture(deployFixture);
      const signatory = registerDocumentRequest.document.signatories[0];

      await contract.registerDocument(registerDocumentRequest.documentHash, registerDocumentRequest.document);

      const result = await contract.proveOwnership(registerDocumentRequest.documentHash, signatory);
      
      expect(result.name).to.equal(registerDocumentRequest.document.name);
      expect(result.description).to.equal(registerDocumentRequest.document.description);
      expect(result.mainDocument.documentHash).to.equal(registerDocumentRequest.document.mainDocument.documentHash);
      expect(result.mainDocument.transactionId).to.equal(registerDocumentRequest.document.mainDocument.transactionId);
    });
  });

  describe("Update permissions - ERROR SCENARIOS", function () {
    it("Grant non-existing role to address", async function () {
      const { contract } = await loadFixture(deployFixture);
      const addressToGrant = registerDocumentRequest.document.signatories[0];

      await expect(
        contract.grantRoleToAddress(NON_EXISTING_ROLE, addressToGrant)
      ).to.be.revertedWith("The role not found.");
    });

    it("Role was not submitted", async function () {
      const { contract } = await loadFixture(deployFixture);
      const addressToGrant = registerDocumentRequest.document.signatories[0];
      
      await expect(
        contract.grantRoleToAddress(ethers.ZeroHash, addressToGrant)
      ).to.be.revertedWith("The role was not submitted.");
    });

    it("Requester does not have permission", async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      const addressToGrant = registerDocumentRequest.document.signatories[0];
      const instanceWithOtherAccount = contract.connect(otherAccount) as RegisterDocument;

      await expect(
        instanceWithOtherAccount.grantRoleToAddress(ADMIN_ROLE, addressToGrant)
      ).to.be.reverted;
      await expect(
        instanceWithOtherAccount.revokeRoleToAddress(ADMIN_ROLE, addressToGrant)
      ).to.be.reverted;
    });
  });

  describe("Update permissions - VALID SCENARIOS", function () {
    it("Grant role to address", async function () {
      const { contract } = await loadFixture(deployFixture);
      const addressToGrant = registerDocumentRequest.document.signatories[0];

      await expect(
        contract.grantRoleToAddress(UPGRADER_ROLE, addressToGrant)
      ).not.be.reverted;

      await expect(
        contract.grantRoleToAddress(ADMIN_ROLE, addressToGrant)
      ).not.be.reverted;
    });

    it("Revoke role to address", async function () {
      const { contract } = await loadFixture(deployFixture);
      const addressToGrant = registerDocumentRequest.document.signatories[0];

      await expect(
        contract.revokeRoleToAddress(UPGRADER_ROLE, addressToGrant)
      ).not.be.reverted;

      await expect(
        contract.revokeRoleToAddress(ADMIN_ROLE, addressToGrant)
      ).not.be.reverted;
    });
  });
});
