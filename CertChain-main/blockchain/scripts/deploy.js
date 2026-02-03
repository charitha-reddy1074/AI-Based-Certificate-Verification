const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CertificateRegistry contract...");

  // Get the contract factory
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");

  // Deploy the contract
  const certificateRegistry = await CertificateRegistry.deploy();

  // Wait for deployment to finish
  await certificateRegistry.waitForDeployment();

  const contractAddress = await certificateRegistry.getAddress();

  console.log("CertificateRegistry deployed to:", contractAddress);

  // Save the contract address to a file for frontend use
  const fs = require("fs");
  const path = require("path");

  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });