// Test creating a group after RLS fix
const testGroupCreation = async () => {
  try {
    console.log('🧪 Testing group creation after RLS fix...');
    
    const response = await fetch('http://localhost:3002/api/admin/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Group After RLS Fix',
        description: 'This group tests if RLS infinite recursion is fixed',
        level: 'beginner',
        age_category: 'youth',
        max_members: 20
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Group created successfully!');
      console.log('Group details:', result);
      console.log('🎉 RLS fix is working - no infinite recursion errors!');
    } else {
      console.log('❌ Error creating group:', result);
      if (result.error?.includes('infinite recursion')) {
        console.log('🔥 CRITICAL: RLS infinite recursion still detected!');
      }
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
};

// Test fetching groups 
const testGroupFetching = async () => {
  try {
    console.log('🧪 Testing group fetching after RLS fix...');
    
    const response = await fetch('http://localhost:3002/api/admin/groups');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Groups fetched successfully!');
      console.log(`Found ${result.length || 0} groups`);
      console.log('🎉 RLS fix is working for group queries!');
    } else {
      console.log('❌ Error fetching groups:', result);
      if (result.error?.includes('infinite recursion')) {
        console.log('🔥 CRITICAL: RLS infinite recursion still detected!');
      }
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
};

// Run tests
console.log('🔧 Testing database operations after RLS fix...\n');
testGroupFetching().then(() => {
  return testGroupCreation();
}).then(() => {
  console.log('\n🎯 All tests completed!');
}).catch(error => {
  console.log('💥 Test failed:', error);
});
