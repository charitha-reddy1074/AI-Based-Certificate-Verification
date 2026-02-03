const { ethers } = require('ethers');
const certificateABI = require('../contracts/CertificateABI.json');

class BlockchainService {
  constructor() {
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.provider = null;
    this.contract = null;

    this.initProvider();
  }

  initProvider() {
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (this.contractAddress) {
      this.contract = new ethers.Contract(this.contractAddress, certificateABI, this.provider);
    }
  }

  async issueCertificate(certData, signerPrivateKey) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('Issuing certificate on blockchain...', certData);

      // Create wallet from private key
      const wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.issueCertificate(
        certData.certId,
        certData.studentName,
        certData.course,
        certData.ipfsHash
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certId: certData.certId
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw new Error('Failed to issue certificate on blockchain');
    }
  }

  async verifyCertificate(certId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('Verifying certificate on blockchain...', certId);
      const result = await this.contract.verifyCertificate(certId);

      if (!result[0]) { // studentName is empty
        return null;
      }

      return {
        studentName: result[0],
        course: result[1],
        ipfsHash: result[2],
        issuedAt: Number(result[3]),
        isValid: result[4],
        issuer: result[5]
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw new Error('Failed to verify certificate');
    }
  }

  async revokeCertificate(certId, signerPrivateKey) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('Revoking certificate on blockchain...', certId);

      const wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.revokeCertificate(certId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        certId
      };
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw new Error('Failed to revoke certificate');
    }
  }

  async getCertificatesByIssuer(issuerAddress, page = 1, limit = 10) {
    // Note: This is a simplified implementation
    // In a real application, you might want to use events or a subgraph
    // to efficiently query certificates by issuer

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // This is a placeholder - you'd need to implement proper indexing
      // for production use (e.g., using The Graph or similar)
      const certificates = [];

      // For now, return empty array with pagination info
      return {
        certificates,
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      };
    } catch (error) {
      console.error('Error getting certificates by issuer:', error);
      throw new Error('Failed to get certificates');
    }
  }

  getContractAddress() {
    return this.contractAddress;
  }

  async getBlockTimestamp(blockNumber) {
    try {
      const block = await this.provider.getBlock(blockNumber);
      return block.timestamp;
    } catch (error) {
      console.error('Error getting block timestamp:', error);
      return null;
    }
  }
}

module.exports = new BlockchainService();