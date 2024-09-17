import { ethers, upgrades } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("RegisterDocument");
  const contract = await upgrades.deployProxy(Contract, { initializer: "initialize", kind: "uups" });
  
  await contract.waitForDeployment();

  console.log(`Proxy contract deployed at ${contract.target}`);
}
 
main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});