/*
 * Test het volledige dashboard flow: maak afspraak en check dashboard
 */

import fetch from 'node-fetch';

async function testCompleteFlow() {
  console.log('Testing complete appointment flow...');
  
  const testEmail = 'qdelarambelje@gmail.com';
  
  try {
    // Step 1: Create a new appointment request
    console.log('\n1. Creating new appointment request...');
    
    const appointmentData = {
      patient_name: 'Test Dashboard Flow',
      patient_email: testEmail,
      patient_phone: '0645512296',
      patient_birth_date: '2005-10-20',
      appointment_type_id: '5e00826a-d875-48e9-aeeb-ed520cf94d75', // Using existing appointment type
      preferred_date: '2025-07-10',
      preferred_time: '14:30:00',
      alternative_dates: [],
      chief_complaint: 'Dashboard test afspraak',
      urgency: 'normal'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/appointment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData)
    });
    
    const createResult = await createResponse.json();
    console.log('Create response:', createResponse.status, createResult);
    
    if (!createResult.success) {
      console.error('Failed to create appointment:', createResult.error);
      return;
    }
    
    console.log('✅ New appointment request created with ID:', createResult.data.id);
    
    // Step 2: Check if it appears in the dashboard API
    console.log('\n2. Checking if appointment appears in dashboard...');
    
    const dashboardResponse = await fetch(`http://localhost:3000/api/user-appointments?userEmail=${testEmail}`);
    const dashboardData = await dashboardResponse.json();
    
    console.log('Dashboard API response:', dashboardResponse.status);
    
    if (dashboardData.success && dashboardData.appointments) {
      console.log(`\n✅ Found ${dashboardData.appointments.length} total appointments/requests:`);
      
      // Look for our newly created appointment
      const newAppointment = dashboardData.appointments.find(app => 
        app.chief_complaint === 'Dashboard test afspraak'
      );
      
      if (newAppointment) {
        console.log('\n🎉 SUCCESS! New appointment is visible in dashboard:');
        console.log(`   ID: ${newAppointment.id}`);
        console.log(`   Type: ${newAppointment.type}`);
        console.log(`   Date: ${newAppointment.date} ${newAppointment.time}`);
        console.log(`   Status: ${newAppointment.status}`);
        console.log(`   Complaint: ${newAppointment.chief_complaint}`);
        console.log(`   Source: ${newAppointment.source}`);
      } else {
        console.log('❌ New appointment not found in dashboard results');
      }
      
      // Show all appointments for debugging
      console.log('\nAll appointments in dashboard:');
      dashboardData.appointments.forEach((app, index) => {
        console.log(`${index + 1}. ${app.type} - ${app.date} ${app.time} - ${app.status} - ${app.chief_complaint}`);
      });
      
    } else {
      console.error('Failed to fetch dashboard data:', dashboardData.error);
    }
    
  } catch (error) {
    console.error('Error in test flow:', error.message);
  }
}

testCompleteFlow();
