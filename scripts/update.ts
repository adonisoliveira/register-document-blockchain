import { ethers, upgrades } from "hardhat";

//ENDEREÇO DO ULTIMO SMART CONTRACT DEPLOYADO AQUI
const addressContractBase = "0x3C1D70624294b02866aDF1Ad30aA9085B95b25d1";

async function main() {
  const Contract = await ethers.getContractFactory("RegisterDocumentV1");
  const contract = await upgrades.upgradeProxy(addressContractBase, Contract);
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
 
  console.log(`Contract updated at ${contractAddress}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});