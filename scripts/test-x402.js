/**
 * Simple test script for x402 payment flow
 * 
 * Usage: node scripts/test-x402.js
 * 
 * This script tests the x402 API endpoints without requiring a wallet connection.
 * For full testing, use the web interface at /spectral
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testX402Quote() {
  console.log('🧪 Testing x402 Payment Quote...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/x402`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (response.status === 402) {
      console.log('✅ Payment quote received (402 as expected)');
      console.log('\nPayment Requirements:');
      console.log(`  Recipient Wallet: ${data.payment.recipientWallet}`);
      console.log(`  Token Account: ${data.payment.tokenAccount}`);
      console.log(`  Mint: ${data.payment.mint}`);
      console.log(`  Amount: ${data.payment.amountUSDC} USDC`);
      console.log(`  Cluster: ${data.payment.cluster}`);
      console.log(`  Message: ${data.payment.message}`);
      return true;
    } else {
      console.log('❌ Unexpected response:', response.status);
      console.log('Response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing quote:', error.message);
    return false;
  }
}

async function testAIEndpoint() {
  console.log('\n🧪 Testing AI Endpoint (should return 402)...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
        model: 'deepthink',
      }),
    });
    
    const data = await response.json();
    
    if (response.status === 402) {
      console.log('✅ AI endpoint correctly returns 402 (payment required)');
      console.log('\nPayment Requirements:');
      console.log(`  Amount: ${data.payment.amountUSDC || data.payment.amount} USDC`);
      return true;
    } else {
      console.log('❌ Unexpected response:', response.status);
      console.log('Response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing AI endpoint:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting x402 API Tests\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('=' .repeat(50));
  
  const quoteTest = await testX402Quote();
  const aiTest = await testAIEndpoint();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`  Payment Quote: ${quoteTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  AI Endpoint: ${aiTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (quoteTest && aiTest) {
    console.log('\n✅ All tests passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Navigate to http://localhost:3000/spectral');
    console.log('   3. Connect your wallet (make sure it\'s on devnet)');
    console.log('   4. Make sure you have devnet USDC tokens');
    console.log('   5. Try sending a message to test the full payment flow');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
  }
}

// Run tests
runTests().catch(console.error);

