# CertChain - Blockchain-Based Certificate Verification System

A tamper-proof academic certificate system where universities issue certificates stored as PDFs on IPFS with metadata stored on Ethereum/Polygon smart contracts. Anyone can verify authenticity without centralized database manipulation.

## 🎯 What We Are Building

### ✅ Final Outcome
- **Universities** issue certificates with MetaMask wallet
- **Certificates** stored as PDFs on IPFS (Web3.Storage)
- **IPFS hash** stored on Ethereum/Polygon smart contract
- **Anyone** can verify authenticity instantly
- **No centralized database** - completely tamper-proof

### 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Ethereum)    │
│                 │    │                 │    │                 │
│ • MetaMask      │    │ • API Routes    │    │ • Smart Contract│
│ • Certificate   │    │ • IPFS Upload   │    │ • Certificate   │
│   Issuance      │    │ • Validation    │    │   Registry      │
│ • Verification  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       └──────────────────────►┌───────────────────────┘
                               │
                        ┌─────────────────┐
                        │   Storage       │
                        │   (IPFS)        │
                        │                 │
                        │ • PDF Files     │
                        │ • Metadata      │
                        │ • Decentralized │
                        └─────────────────┘
```

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Blockchain** | Ethereum / Polygon + Solidity + Hardhat |
| **Smart Contracts** | Solidity ^0.8.20 |
| **Wallet** | MetaMask |
| **Storage** | Web3.Storage (IPFS) |
| **Network** | Polygon Mumbai (Testnet) / Polygon Mainnet |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd certchain

# Install root dependencies
npm install

# Install blockchain dependencies
cd blockchain && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Environment Setup

#### Blockchain (.env)
```bash
cd blockchain
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with contract address and API keys
```

#### Frontend (.env.local)
```bash
cd client
cp .env.example .env.local
# Edit .env.local with contract address and IPFS token
```

### 3. Deploy Smart Contract

```bash
cd blockchain
npm run compile
npm run deploy
# Copy contract address to frontend and backend .env files
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd client && npm run dev

# Terminal 3: Blockchain (optional - for local testing)
cd blockchain && npm run node
```

## 📁 Project Structure

```
CertChain/
│
├── blockchain/                     # 🔗 Smart Contracts & Deployment
│   ├── contracts/
│   │   └── CertificateRegistry.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── artifacts/                  # Auto-generated ABI & bytecode
│   ├── test/
│   │   └── certificate.test.js
│   ├── hardhat.config.js
│   ├── package.json
│   ├── .env                        # PRIVATE (RPC, private key)
│   └── README.md
│
├── backend/                        # 🧠 API Layer
│   ├── routes/
│   │   └── certificate.js
│   ├── controllers/
│   │   └── certificateController.js
│   ├── services/
│   │   ├── ipfsService.js
│   │   ├── blockchainService.js
│   │   └── certificateService.js
│   ├── contracts/
│   │   └── CertificateABI.json
│   ├── app.js
│   ├── package.json
│   └── .env
│
├── client/                         # 🌐 React Web App
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   │   ├── contract.ts         # Ethers.js contract instance
│   │   │   ├── ipfs.ts             # Web3.Storage IPFS logic
│   │   │   ├── CertificateABI.json
│   │   │   └── constants.ts        # Contract address, network
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.local                  # Frontend env vars
│   └── package.json
│
├── docs/                           # 📄 Documentation
│   ├── README.md                   # Detailed documentation
│   └── architecture-diagrams/      # System diagrams
│
├── .gitignore
└── README.md
```

## 🔐 Smart Contract Details

### CertificateRegistry Contract

**Key Functions:**
- `issueCertificate()` - Issue new certificate
- `verifyCertificate()` - Verify certificate authenticity
- `revokeCertificate()` - Revoke compromised certificates
- `addAuthorizedIssuer()` - Grant issuance permissions

**Security Features:**
- Access control (only authorized issuers)
- Certificate uniqueness validation
- Revocation capability
- Immutable audit trail

## 🌐 API Endpoints

### Certificate Management
- `POST /api/certificates/issue` - Issue new certificate
- `GET /api/certificates/verify/:certId` - Verify certificate
- `POST /api/certificates/revoke/:certId` - Revoke certificate
- `GET /api/certificates/list` - List certificates

## 🔧 Development Commands

### Blockchain
```bash
cd blockchain
npm run compile          # Compile contracts
npm run test            # Run tests
npm run deploy         # Deploy to testnet
npm run deploy-local   # Deploy to local network
```

### Backend
```bash
cd backend
npm run dev            # Start development server
npm run start          # Start production server
npm test              # Run tests
```

### Frontend
```bash
cd client
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

## 🔑 Environment Variables

### Required Variables

#### Blockchain (.env)
```env
PRIVATE_KEY=your_private_key_here
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

#### Backend (.env)
```env
CONTRACT_ADDRESS=0x... # From deployment
WEB3_STORAGE_TOKEN=your_web3_storage_token
UNIVERSITY_PRIVATE_KEY=your_university_private_key
```

#### Frontend (.env.local)
```env
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_WEB3_STORAGE_TOKEN=your_token
REACT_APP_NETWORK=polygonMumbai
```

## 🚀 Deployment

### Smart Contract Deployment
1. Configure `.env` in blockchain folder
2. Run `npm run deploy` for testnet
3. Verify contract on PolygonScan
4. Copy contract address to frontend/backend

### Application Deployment
1. Build frontend: `cd client && npm run build`
2. Deploy backend to your server
3. Configure environment variables
4. Start services

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain
npm test
```

### Integration Tests
```bash
# Test full certificate issuance flow
npm run test:e2e
```

## 📊 Monitoring & Analytics

- Contract events logged on blockchain
- IPFS file access tracking
- API usage metrics
- Error logging and alerting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- 📧 Email: support@certchain.com
- 💬 Discord: [CertChain Community](https://discord.gg/certchain)
- 📖 Docs: [Full Documentation](./docs/README.md)

---

**Built with ❤️ for secure, decentralized education credentials**
