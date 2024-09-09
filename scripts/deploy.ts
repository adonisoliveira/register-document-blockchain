import { ethers, upgrades } from "hardhat";
 
async function main() {
  const Contract = await ethers.getContractFactory("RegisterDocument");
  const contract = await upgrades.deployProxy(Contract, { initializer: "initialize" });

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log(`Contract deployed at ${contractAddress}`);
}
 
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});