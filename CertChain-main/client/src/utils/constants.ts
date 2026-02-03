// Frontend Constants and Configuration

export const CONTRACT_ADDRESS = import.meta.env.REACT_APP_CONTRACT_ADDRESS || '0x...';
export const NETWORK = import.meta.env.REACT_APP_NETWORK || 'polygonMumbai';
export const WEB3_STORAGE_TOKEN = import.meta.env.REACT_APP_WEB3_STORAGE_TOKEN || '';

// Network configurations
export const NETWORKS = {
  polygonMumbai: {
    chainId: '0x13881', // 80001 in decimal
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
  polygonMainnet: {
    chainId: '0x89', // 137 in decimal
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
};

// Certificate status
export const CERTIFICATE_STATUS = {
  VALID: 'valid',
  INVALID: 'invalid',
  REVOKED: 'revoked',
  NOT_FOUND: 'not_found',
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
};

// API endpoints (if using backend)
export const API_ENDPOINTS = {
  CERTIFICATES: '/api/certificates',
  VERIFY: '/api/verify',
  UPLOAD: '/api/upload',
};

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'certchain_wallet_connected',
  USER_ROLE: 'certchain_user_role',
  THEME: 'certchain_theme',
};

// Certificate ID format validation
export const CERTIFICATE_ID_REGEX = /^CERT\d{6}$/;

// Transaction status
export const TX_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your MetaMask wallet first',
  NETWORK_MISMATCH: 'Please switch to Polygon network',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  INVALID_FILE_TYPE: 'Only PDF files are allowed',
  CONTRACT_ERROR: 'Blockchain transaction failed',
  IPFS_ERROR: 'File upload to IPFS failed',
  CERTIFICATE_NOT_FOUND: 'Certificate not found',
  CERTIFICATE_REVOKED: 'This certificate has been revoked',
};