// Quick API test for appointment booking
import fetch from 'node-fetch';

async function testAPI() {
  console.log('Testing MedCheck+ API...');
  
  // Test data for appointment request
  const testData = {
    patient_name: 'Test Patient API Check',
    patient_email: '199380@novacollege.nl',
    patient_phone: '0612345678',
    appointment_type_id: '5e00826a-d875-48e9-aeeb-ed520cf94d75',
    preferred_date: '2025-07-05',
    preferred_time: '10:00',
    chief_complaint: 'Test voor API verificatie',
    urgency: 'normal'
  };

  try {
    console.log('📤 Creating appointment request...');
    const response = await fetch('http://localhost:3000/api/appointment-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Appointment request created successfully!');
      console.log('Request ID:', result.data.id);
      
      // Now test fetching user appointments
      console.log('📥 Fetching user appointments...');
      const userResponse = await fetch(`http://localhost:3000/api/user-appointments?userEmail=${testData.patient_email}`);
      const userResult = await userResponse.json();
      
      if (userResponse.ok) {
        console.log('✅ User appointments fetched successfully!');
        console.log('Appointments found:', userResult.appointments?.length || 0);
      } else {
        console.log('❌ Failed to fetch user appointments');
      }
      
    } else {
      console.log('❌ Failed to create appointment request');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

testAPI();
