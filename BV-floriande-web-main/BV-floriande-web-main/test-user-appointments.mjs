/*
 * Test script to check if user appointments API works
 */

import fetch from 'node-fetch';

async function testUserAppointmentsAPI() {
  console.log('Testing user appointments API...');
  
  // Test with email (since patient_id is null in our test data)
  const testEmail = 'qdelarambelje@gmail.com';  // This email exists in our test data
  const apiUrl = `http://localhost:3000/api/user-appointments?userEmail=${testEmail}`;
  
  try {
    console.log(`Calling: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.appointments) {
      console.log(`\nFound ${data.appointments.length} appointments/requests:`);
      
      data.appointments.forEach((appointment, index) => {
        console.log(`\n${index + 1}. ${appointment.type}`);
        console.log(`   Date: ${appointment.date} ${appointment.time}`);
        console.log(`   Status: ${appointment.status}`);
        console.log(`   Source: ${appointment.source}`);
        console.log(`   Doctor: ${appointment.doctor_name}`);
        console.log(`   Location: ${appointment.location}`);
        if (appointment.chief_complaint) {
          console.log(`   Complaint: ${appointment.chief_complaint}`);
        }
      });
    } else {
      console.error('API call failed:', data.error);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testUserAppointmentsAPI();
