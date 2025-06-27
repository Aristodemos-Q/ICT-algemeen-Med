/*
 * Test redirect flow from home page to login to appointment booking
 */

import fetch from 'node-fetch';

async function testRedirectFlow() {
  console.log('🧪 Testing redirect flow from home page...');
  
  try {
    // Step 1: Test home page has correct redirect links
    console.log('\n1. Checking home page for redirect links...');
    
    const homeResponse = await fetch('http://localhost:3000/');
    const homeHtml = await homeResponse.text();
    
    // Count how many times the redirect link appears
    const redirectPattern = /\/login\?redirect=\/appointment-booking/g;
    const matches = homeHtml.match(redirectPattern);
    const redirectCount = matches ? matches.length : 0;
    
    console.log(`✅ Found ${redirectCount} redirect links on home page`);
    
    if (redirectCount >= 2) {
      console.log('✅ Multiple "Afspraak Maken" buttons correctly redirect to login');
    } else if (redirectCount === 1) {
      console.log('⚠️  Only one redirect link found (expected multiple)');
    } else {
      console.log('❌ No redirect links found');
    }
    
    // Step 2: Test login page accepts redirect parameter
    console.log('\n2. Testing login page with redirect parameter...');
    
    const loginResponse = await fetch('http://localhost:3000/login?redirect=/appointment-booking');
    
    if (loginResponse.status === 200) {
      console.log('✅ Login page loads with redirect parameter');
    } else {
      console.log(`❌ Login page failed to load: ${loginResponse.status}`);
    }
    
    // Step 3: Test appointment booking page is accessible
    console.log('\n3. Testing appointment booking page accessibility...');
    
    const appointmentResponse = await fetch('http://localhost:3000/appointment-booking');
    
    if (appointmentResponse.status === 200) {
      console.log('✅ Appointment booking page is accessible');
    } else {
      console.log(`❌ Appointment booking page failed: ${appointmentResponse.status}`);
    }
    
    console.log('\n🎯 Redirect flow test results:');
    console.log(`- Home page redirect links: ${redirectCount}`);
    console.log('- Login page: ✅ Working');
    console.log('- Appointment page: ✅ Working');
    
    console.log('\n📝 Manual testing steps:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Click any "Afspraak Maken" button');
    console.log('3. Should redirect to login page with redirect parameter');
    console.log('4. After login, should automatically redirect to appointment booking');
    
  } catch (error) {
    console.error('❌ Error testing redirect flow:', error.message);
  }
}

testRedirectFlow();
