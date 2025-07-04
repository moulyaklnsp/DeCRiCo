const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeCRiCo contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy ReputationContract first
  console.log("\nDeploying ReputationContract...");
  const ReputationContract = await ethers.getContractFactory("ReputationContract");
  const reputationContract = await ReputationContract.deploy();
  await reputationContract.deployed();
  console.log("ReputationContract deployed to:", reputationContract.address);

  // Deploy AidRequestContract
  console.log("\nDeploying AidRequestContract...");
  const AidRequestContract = await ethers.getContractFactory("AidRequestContract");
  const aidRequestContract = await AidRequestContract.deploy();
  await aidRequestContract.deployed();
  console.log("AidRequestContract deployed to:", aidRequestContract.address);

  // Deploy GovernanceContract
  console.log("\nDeploying GovernanceContract...");
  const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
  const governanceContract = await GovernanceContract.deploy();
  await governanceContract.deployed();
  console.log("GovernanceContract deployed to:", governanceContract.address);

  // Authorize contracts to update reputation
  console.log("\nAuthorizing contracts for reputation updates...");
  await reputationContract.authorizeContract(aidRequestContract.address);
  await reputationContract.authorizeContract(governanceContract.address);
  console.log("Contracts authorized for reputation updates");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      ReputationContract: reputationContract.address,
      AidRequestContract: aidRequestContract.address,
      GovernanceContract: governanceContract.address
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });