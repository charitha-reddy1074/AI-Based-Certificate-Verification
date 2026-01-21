import { ethers } from 'ethers';
import { CertificateRegistry } from "C:\Users\chari\Downloads\CertChain-main\CertChain-main\blockchain\artifacts\contracts\CertificateRegistry.sol\CertificateRegistry.json"

const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!; // Set this after deployment
const contract = new ethers.Contract(contractAddress, CertificateRegistry.abi, wallet);

export async function issueCertificateOnChain(rollNumber: string, ipfsCid: string): Promise<string> {
  const tx = await contract.issueCertificate(rollNumber, ipfsCid);
  await tx.wait();
  return tx.hash;
}

export async function verifyCertificateOnChain(rollNumber: string): Promise<string> {
  return await contract.verifyCertificate(rollNumber);
}
