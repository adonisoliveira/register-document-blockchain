import { ethers, upgrades } from "hardhat";

//ENDEREÇO DO ULTIMO SMART CONTRACT DEPLOYADO AQUI
const addressContractBase = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const Contract = await ethers.getContractFactory("RegisterDocument");
  const contract = await upgrades.upgradeProxy(addressContractBase, Contract);
  
  await contract.waitForDeployment();
  
  console.log(`Contract updated at ${contract.target}`);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});