import { ethers } from 'ethers';
import CertificateABI from './CertificateABI.json';
import { CONTRACT_ADDRESS, NETWORKS, NETWORK, ERROR_MESSAGES } from './constants';

export interface Certificate {
  id: string;
  studentName: string;
  course: string;
  ipfsHash: string;
  issuedAt: number;
  isValid: boolean;
  issuer: string;
  txHash?: string;
  blockNumber?: number;
  rollNumber?: string;
  branch?: string;
  joiningYear?: number;
  passingYear?: number;
  university?: string;
}

export class CertificateContract {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;
  private provider: ethers.BrowserProvider | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Switch to correct network
      await this.ensureCorrectNetwork();

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CertificateABI, this.signer);

      const address = await this.signer.getAddress();
      console.log('Wallet connected:', address);

      return address;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  private async ensureCorrectNetwork(): Promise<void> {
    if (!window.ethereum) return;

    const networkConfig = NETWORKS[NETWORK as keyof typeof NETWORKS];
    if (!networkConfig) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        } catch (addError) {
          throw new Error('Failed to add network to MetaMask');
        }
      } else {
        throw new Error(ERROR_MESSAGES.NETWORK_MISMATCH);
      }
    }
  }

  async issueCertificate(
    certId: string,
    studentName: string,
    course: string,
    ipfsHash: string
  ): Promise<any> {
    if (!this.contract || !this.signer) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    try {
      console.log('Issuing certificate on blockchain...', { certId, studentName, course, ipfsHash });

      const tx = await this.contract.issueCertificate(certId, studentName, course, ipfsHash);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('Error issuing certificate:', error);

      if (error.reason) {
        throw new Error(`Transaction failed: ${error.reason}`);
      }

      throw new Error('Failed to issue certificate on blockchain. Please check your wallet and try again.');
    }
  }

  async verifyCertificate(certId: string): Promise<Certificate | null> {
    if (!this.contract) {
      // Initialize contract in read-only mode if not connected
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CertificateABI, provider);
      } else {
        throw new Error('Please install MetaMask to verify certificates');
      }
    }

    try {
      console.log('Verifying certificate on blockchain...', certId);
      const result = await this.contract.verifyCertificate(certId);

      if (!result[0]) { // studentName is empty
        return null;
      }

      const certificate: Certificate = {
        id: certId,
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
      throw new Error('Failed to verify certificate. Please check the certificate ID and try again.');
    }
  }

  async getCertificate(certId: string): Promise<Certificate> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const cert = await this.contract.getCertificate(certId);
      return {
        id: certId,
        studentName: cert.studentName,
        course: cert.course,
        ipfsHash: cert.ipfsHash,
        issuedAt: Number(cert.issuedAt),
        isValid: cert.isValid,
        issuer: cert.issuer
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw new Error('Failed to get certificate details');
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
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    try {
      console.log('Revoking certificate on blockchain...', certId);
      const tx = await this.contract.revokeCertificate(certId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('Error revoking certificate:', error);

      if (error.reason) {
        throw new Error(`Transaction failed: ${error.reason}`);
      }

      throw new Error('Failed to revoke certificate on blockchain');
    }
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  isConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.contract = null;
    this.signer = null;
    this.provider = null;
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