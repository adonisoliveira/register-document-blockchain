import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RegisterDocument = buildModule("RegisterDocument", (m) => {
  const contract = m.contract("RegisterDocument");

  return { contract };
});

module.exports = RegisterDocument;