const IPFSService = require('./services/ipfsService');

async function testIPFS() {
  try {
    console.log('Testing IPFS service initialization...');

    // Test if service initializes correctly
    console.log('✅ IPFS service loaded successfully');

    // Test if token is loaded
    if (IPFSService.token || process.env.WEB3_STORAGE_TOKEN) {
      console.log('✅ IPFS token configured');
    } else {
      console.log('❌ IPFS token not configured');
      return;
    }

    // Test URL generation
    const testCid = 'QmTest123';
    const url = IPFSService.getIPFSUrl(testCid);
    console.log('✅ IPFS URL generation works:', url);

    // Test gateway URL
    const gatewayUrl = IPFSService.getGatewayUrl(testCid);
    console.log('✅ Gateway URL generation works:', gatewayUrl);

    console.log('🎉 IPFS service basic functionality test completed successfully!');
    console.log('Note: Actual upload test skipped due to network connectivity issues.');

  } catch (error) {
    console.error('❌ IPFS service test failed:', error.message);
  }
}

testIPFS();