# CertChain Blockchain

Smart contracts and deployment scripts for the CertChain certificate verification system.

## Overview

This directory contains the blockchain components of CertChain:

- **CertificateRegistry.sol**: Smart contract for issuing and verifying certificates on Ethereum/Polygon
- **Deployment scripts**: Automated deployment to testnet/mainnet
- **Tests**: Comprehensive test suite for smart contract functionality

## Prerequisites

- Node.js 16+
- npm or yarn
- MetaMask wallet with testnet funds (for deployment)

## Installation

```bash
cd blockchain
npm install
```

## Environment Setup

1. Copy `.env` and fill in your values:
```bash
cp .env .env.local
```

2. Get a private key from MetaMask (export it securely)
3. Get RPC URLs from Infura/Alchemy
4. Get API keys from PolygonScan

## Local Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Start local Hardhat network
npm run node
```

## Deployment

### Local Deployment (Testing)
```bash
npm run deploy-local
```

### Testnet Deployment (Polygon Mumbai)
```bash
npm run deploy
```

### Mainnet Deployment (Polygon)
```bash
npx hardhat run scripts/deploy.js --network polygonMainnet
```

## Contract Verification

After deployment, verify the contract on PolygonScan:

```bash
npx hardhat verify --network polygonMumbai CONTRACT_ADDRESS
```

## Contract Address

After deployment, the contract address will be saved in `deployment.json`. Copy this address to your frontend environment variables.

## Architecture

- **CertificateRegistry**: Main contract for certificate management
- **Events**: CertificateIssued, CertificateRevoked
- **Access Control**: University (admin) and authorized issuers
- **Storage**: Certificate data stored on-chain, PDFs on IPFS

## Security

- Only authorized issuers can issue certificates
- Certificates can be revoked by authorized parties
- All transactions are recorded on-chain immutably
- IPFS ensures file integrity and availability