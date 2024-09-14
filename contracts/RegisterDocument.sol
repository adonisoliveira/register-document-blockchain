// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract RegisterDocument is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct MainDocument {
        bytes32 documentHash;
        string transactionId;
    }

    struct Document {
        MainDocument mainDocument;
        string name;
        string description;
        address[] signatories;
    }

    mapping(bytes32 => Document) private documents;

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation) internal onlyRole(UPGRADER_ROLE) override {}

    function grantRoleToAddress(bytes32 role, address addressToGrant) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validateRoleExists(role);
        grantRole(role, addressToGrant);
    }

    function revokeRoleToAddress(bytes32 role, address addressToRovoke) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validateRoleExists(role);
        revokeRole(role, addressToRovoke);
    }

    function registerDocument(bytes32 documentHash, Document calldata document) external onlyRole(ADMIN_ROLE) {
        if (documentHash == bytes32(0) || bytes(document.name).length == 0 || bytes(document.description).length == 0) {
            revert("The document data was not submitted.");
        }

        //Get the document by hash. if the document is found, don't allow updates to the document.
        if (documents[documentHash].signatories.length > 0) {
            revert("Unable to save this document.");
        }

        //Validate whether main document exists.
        bytes32 mainDocumentHash = document.mainDocument.documentHash;

        if (mainDocumentHash != bytes32(0) && documents[mainDocumentHash].signatories.length == 0) {
            revert("Main document not found.");
        }

        //Validate whether any signatory was submitted, check for repeated signatories, and ensure that they are valid addresses.
        uint256 numberOfSignatories = document.signatories.length;

        if (numberOfSignatories == 0) {
            revert("No signatories were provided.");
        }

        for (uint256 indexA = 0; indexA < numberOfSignatories; indexA++) {
            address signatoryAddress = document.signatories[indexA];

            //Validate whether the signatory address is valid.
            validateZeroAddress(signatoryAddress);

            for (uint256 indexB = indexA + 1; indexB < numberOfSignatories; indexB++) {
                if (signatoryAddress == document.signatories[indexB]) {
                    revert("There are repeat signatories to this document.");
                }
            }
        }

        documents[documentHash] = document;
    }

    function proveOwnership(bytes32 documentHash, address signatoryAddress) external view returns(Document memory) {
        validateZeroAddress(signatoryAddress);

        uint256 numberOfSignatories = documents[documentHash].signatories.length;

        if (numberOfSignatories > 0) {
            for (uint256 index = 0; index < numberOfSignatories; index++) {
                if (documents[documentHash].signatories[index] == signatoryAddress) {
                    Document memory document;
                    document.name = documents[documentHash].name;
                    document.description = documents[documentHash].description;
                    document.mainDocument = documents[documentHash].mainDocument;

                    return document;
                }
            }
        }

        revert("It was not possible to prove ownership of the document.");
    }

    function findDocumentByHash(bytes32 documentHash) external view onlyRole(ADMIN_ROLE) returns(Document memory) {
        return documents[documentHash];
    }

    function validateZeroAddress(address signatoryAddress) private pure {
        if (signatoryAddress == address(0)) {
            revert("Invalid signatory.");
        }
    }

    function validateRoleExists(bytes32 role) private pure {
        if (role == bytes32(0)) {
            revert("The role was not submitted.");
        }

        if (role != UPGRADER_ROLE && role != ADMIN_ROLE) {
            revert("The role not found.");
        }
    }
}