/*
 * Test script voor het testen van de appointment redirect flow
 */

async function testRedirectFlow() {
  console.log('Testing appointment redirect flow...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check redirect page exists
    console.log('\n1. Testing appointment-redirect page...');
    const redirectResponse = await fetch(`${baseUrl}/appointment-redirect`);
    console.log('Redirect page status:', redirectResponse.status);
    
    if (redirectResponse.ok) {
      console.log('✅ Appointment redirect page is accessible');
    } else {
      console.log('❌ Appointment redirect page not found');
    }
    
    // Test 2: Check login page with redirect parameter
    console.log('\n2. Testing login with redirect parameter...');
    const loginWithRedirectResponse = await fetch(`${baseUrl}/login?redirect=/appointment-booking&from=home`);
    console.log('Login with redirect status:', loginWithRedirectResponse.status);
    
    if (loginWithRedirectResponse.ok) {
      console.log('✅ Login page accepts redirect parameters');
    } else {
      console.log('❌ Login page with redirect not accessible');
    }
    
    // Test 3: Check appointment-booking page
    console.log('\n3. Testing appointment-booking page...');
    const appointmentResponse = await fetch(`${baseUrl}/appointment-booking`);
    console.log('Appointment booking page status:', appointmentResponse.status);
    
    if (appointmentResponse.ok) {
      console.log('✅ Appointment booking page is accessible');
    } else {
      console.log('❌ Appointment booking page not accessible');
    }
    
    console.log('\n🎉 Redirect flow test completed!');
    console.log('\nFlow explanation:');
    console.log('1. Homepage "Afspraak maken" button → /appointment-redirect');
    console.log('2. /appointment-redirect checks authentication:');
    console.log('   - If logged in → /appointment-booking');
    console.log('   - If not logged in → /login?redirect=/appointment-booking&from=home');
    console.log('3. After login → redirect to /appointment-booking');
    
  } catch (error) {
    console.error('Error testing redirect flow:', error.message);
  }
}

testRedirectFlow();
