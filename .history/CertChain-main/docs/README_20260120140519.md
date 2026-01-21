# CertChain Documentation

Blockchain-based certificate verification system with tamper-proof certificates stored on IPFS and Ethereum/Polygon blockchain.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Flow](#system-flow)
- [Smart Contract Details](#smart-contract-details)
- [Frontend Integration](#frontend-integration)
- [API Documentation](#api-documentation)
- [Deployment Guide](#deployment-guide)
- [Security Considerations](#security-considerations)

## 🏗️ Architecture Overview

CertChain consists of three main layers:

### 1. Frontend Layer (React/Next.js)
- Certificate issuance interface for universities
- Public verification portal
- MetaMask wallet integration
- File upload to IPFS

### 2. Blockchain Layer (Ethereum/Polygon)
- Smart contract for certificate registry
- Immutable certificate records
- Access control for authorized issuers

### 3. Storage Layer (IPFS)
- Decentralized file storage for PDFs
- Content addressing ensures integrity
- Distributed availability

## 🔄 System Flow

### Certificate Issuance
1. University admin logs in and connects MetaMask
2. Uploads certificate PDF and enters metadata
3. PDF is uploaded to IPFS (Web3.Storage)
4. Certificate data + IPFS hash stored on blockchain
5. Unique certificate ID generated and returned

### Certificate Verification
1. Anyone can enter certificate ID
2. System queries blockchain for certificate data
3. IPFS hash retrieved and PDF displayed
4. Certificate validity confirmed on-chain

## 📄 Smart Contract Details

### CertificateRegistry Contract

**Key Functions:**
- `issueCertificate()`: Issue new certificate
- `verifyCertificate()`: Verify certificate authenticity
- `revokeCertificate()`: Revoke compromised certificates
- `addAuthorizedIssuer()`: Grant issuance permissions

**Events:**
- `CertificateIssued`: Emitted when certificate is issued
- `CertificateRevoked`: Emitted when certificate is revoked

**Security Features:**
- Access control (only authorized issuers)
- Certificate uniqueness validation
- Revocation capability
- Immutable audit trail

## 🌐 Frontend Integration

### Wallet Connection
```javascript
import { certificateContract } from './utils/contract';

// Connect MetaMask
const walletAddress = await certificateContract.connectWallet();
```

### Certificate Issuance
```javascript
import { uploadToIPFS } from './utils/ipfs';

// Upload PDF to IPFS
const ipfsHash = await uploadToIPFS(pdfFile);

// Issue certificate on blockchain
await certificateContract.issueCertificate(certId, studentName, course, ipfsHash);
```

### Certificate Verification
```javascript
// Verify certificate
const certificate = await certificateContract.verifyCertificate(certId);
if (certificate && certificate.isValid) {
  // Display certificate details
  // Load PDF from IPFS
}
```

## 🚀 Deployment Guide

### Prerequisites
- Node.js 16+
- MetaMask wallet
- Web3.Storage API token
- Polygon Mumbai testnet funds

### Smart Contract Deployment
```bash
cd blockchain
npm install
npm run compile
npm run deploy
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
# Fill in environment variables
npm run dev
```

### Environment Variables
```env
# Frontend (.env.local)
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_WEB3_STORAGE_TOKEN=your_token_here

# Blockchain (.env)
PRIVATE_KEY=your_private_key
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

## 🔒 Security Considerations

### Smart Contract Security
- Access control prevents unauthorized issuance
- Certificate uniqueness prevents duplicates
- Revocation mechanism for compromised certificates
- Events provide audit trail

### IPFS Security
- Content addressing ensures file integrity
- Decentralized storage prevents single points of failure
- Files are immutable once uploaded

### Frontend Security
- MetaMask handles private key security
- Input validation prevents malicious data
- HTTPS ensures secure communication

## 📊 Database Schema (Optional Backend)

If using a traditional database for additional features:

```sql
-- Certificates table (for additional metadata)
CREATE TABLE certificates (
  id VARCHAR PRIMARY KEY,
  student_name VARCHAR NOT NULL,
  course VARCHAR NOT NULL,
  ipfs_hash VARCHAR NOT NULL,
  blockchain_tx_hash VARCHAR,
  issued_at TIMESTAMP DEFAULT NOW(),
  is_valid BOOLEAN DEFAULT TRUE
);
```

## 🔧 Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Check network is set to Polygon Mumbai

2. **IPFS Upload Failed**
   - Verify Web3.Storage API token
   - Check internet connection

3. **Contract Interaction Failed**
   - Verify contract address is correct
   - Ensure sufficient gas fees
   - Check wallet has testnet funds

### Support

For issues and questions:
- Check the test suite: `npm test`
- Review contract events on PolygonScan
- Verify IPFS files on gateway.ipfs.io

## 📈 Future Enhancements

- Multi-signature certificate approval
- Certificate templates and branding
- Bulk certificate issuance
- Integration with university systems
- Mobile app for verification
- Certificate analytics dashboard