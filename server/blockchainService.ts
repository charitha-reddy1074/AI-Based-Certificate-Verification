import { ethers } from 'ethers';
// Use the "import" syntax with type assertion for JSON in ES Modules
import CertificateRegistry from "../CertChain-main/blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json" assert { type: "json" };
// Validate environment variables early to prevent cryptic runtime errors
if (!process.env.ETH_RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
  throw new Error("Missing Blockchain environment variables. Check ETH_RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS.");
}

const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

// Initialize the contract instance
const contract = new ethers.Contract(contractAddress, CertificateRegistry.abi, wallet);

/**
 * Issues a certificate on the Polygon/Ethereum blockchain.
 */
export async function issueCertificateOnChain(rollNumber: string, ipfsCid: string): Promise<string> {
  try {
    console.log(`Issuing certificate on-chain for Roll: ${rollNumber}...`);
    
    // Call the smart contract function
    const tx = await contract.issueCertificate(rollNumber, ipfsCid);
    
    // Wait for the transaction to be mined (1 confirmation)
    const receipt = await tx.wait();
    
    console.log(`Certificate issued! Hash: ${receipt.hash}`);
    return receipt.hash;
  } catch (error: any) {
    console.error("Blockchain Issue Error:", error);
    throw new Error(`Failed to issue certificate on-chain: ${error.message}`);
  }
}

/**
 * Verifies a certificate by retrieving the IPFS CID from the blockchain.
 */
export async function verifyCertificateOnChain(rollNumber: string): Promise<string> {
  try {
    const cid = await contract.verifyCertificate(rollNumber);
    
    if (!cid || cid === "") {
      throw new Error("No certificate found for this roll number.");
    }
    
    return cid;
  } catch (error: any) {
    console.error("Blockchain Verify Error:", error);
    throw new Error(`Could not verify certificate: ${error.message}`);
  }
}