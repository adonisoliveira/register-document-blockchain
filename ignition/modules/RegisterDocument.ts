import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RegisterDocument = buildModule("RegisterDocument", (registerDocument) => {
  const contract = registerDocument.contract("RegisterDocument");

  return { contract };
});

module.exports = RegisterDocument;