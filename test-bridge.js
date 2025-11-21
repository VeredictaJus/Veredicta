// Test script to check if the bridge service is working
import fetch from 'node-fetch';

async function testBridge() {
  try {
    console.log('🧪 Testing bridge service...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test session endpoint with a dummy token
    const sessionResponse = await fetch('http://localhost:3001/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'dummy-token' })
    });
    
    const sessionData = await sessionResponse.json();
    console.log('📊 Session response:', sessionData);
    
  } catch (error) {
    console.error('❌ Bridge test failed:', error.message);
  }
}

testBridge();
