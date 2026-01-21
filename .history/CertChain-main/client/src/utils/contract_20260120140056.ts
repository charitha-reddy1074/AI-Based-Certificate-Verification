import { ethers } from 'ethers';
import CertificateABI from './CertificateABI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x...'; // Replace with deployed contract address

export interface Certificate {
  studentName: string;
  course: string;
  ipfsHash: string;
  issuedAt: number;
  isValid: boolean;
  issuer: string;
}

export class CertificateContract {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await provider.getSigner();
      const address = await this.signer.getAddress();

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CertificateABI, this.signer);

      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async issueCertificate(
    certId: string,
    studentName: string,
    course: string,
    ipfsHash: string
  ): Promise<any> {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Issuing certificate on blockchain...');
      const tx = await this.contract.issueCertificate(certId, studentName, course, ipfsHash);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      return receipt;
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw new Error('Failed to issue certificate on blockchain');
    }
  }

  async verifyCertificate(certId: string): Promise<Certificate | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('Verifying certificate on blockchain...');
      const result = await this.contract.verifyCertificate(certId);

      if (!result[0]) { // studentName is empty
        return null;
      }

      const certificate: Certificate = {
        studentName: result[0],
        course: result[1],
        ipfsHash: result[2],
        issuedAt: Number(result[3]),
        isValid: result[4],
        issuer: result[5]
      };

      return certificate;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw new Error('Failed to verify certificate');
    }
  }

  async getCertificate(certId: string): Promise<Certificate> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const cert = await this.contract.getCertificate(certId);
      return {
        studentName: cert.studentName,
        course: cert.course,
        ipfsHash: cert.ipfsHash,
        issuedAt: Number(cert.issuedAt),
        isValid: cert.isValid,
        issuer: cert.issuer
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw new Error('Failed to get certificate');
    }
  }

  async isCertificateValid(certId: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.isCertificateValid(certId);
    } catch (error) {
      console.error('Error checking certificate validity:', error);
      return false;
    }
  }

  async revokeCertificate(certId: string): Promise<any> {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Revoking certificate on blockchain...');
      const tx = await this.contract.revokeCertificate(certId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw new Error('Failed to revoke certificate');
    }
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  isConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }
}

// Singleton instance
export const certificateContract = new CertificateContract();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}