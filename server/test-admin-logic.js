// Simple test to verify admin logic
const testAdminLogic = () => {
  console.log('🧪 Testing Admin Logic...\n');
  
  // Mock user data
  const user = {
    id: 'user123',
    email: 'creator@example.com',
    role: 'user'
  };
  
  // Mock meeting data
  const meeting = {
    _id: 'meeting123',
    title: 'Test Meeting',
    creator: 'creator@example.com', // Same as user email
    admins: []
  };
  
  // Test admin detection logic
  const isGlobalAdmin = user?.role === 'admin' || user?.isAdmin || false;
  const isAdminForMeeting = (meeting) => {
    return isGlobalAdmin || 
           meeting.creator === user?.id || 
           meeting.creator === user?.email ||
           meeting.isAdmin;
  };
  
  console.log('👤 User:', user);
  console.log('📅 Meeting:', meeting);
  console.log('🔑 Is Global Admin:', isGlobalAdmin);
  console.log('🎯 Is Admin for this Meeting:', isAdminForMeeting(meeting));
  
  // Test different scenarios
  console.log('\n📋 Test Scenarios:');
  
  // Scenario 1: User is creator
  console.log('1. User is meeting creator:', isAdminForMeeting(meeting) ? '✅ Admin' : '❌ Not Admin');
  
  // Scenario 2: User is global admin
  const globalAdminUser = { ...user, role: 'admin' };
  const isGlobalAdminTest = globalAdminUser?.role === 'admin' || globalAdminUser?.isAdmin || false;
  console.log('2. User is global admin:', isGlobalAdminTest ? '✅ Admin' : '❌ Not Admin');
  
  // Scenario 3: User is not creator or admin
  const regularUser = { ...user, email: 'regular@example.com' };
  const isAdminForRegularUser = (meeting) => {
    return false || 
           meeting.creator === regularUser?.id || 
           meeting.creator === regularUser?.email ||
           meeting.isAdmin;
  };
  console.log('3. Regular user:', isAdminForRegularUser(meeting) ? '✅ Admin' : '❌ Not Admin');
  
  console.log('\n🎉 Admin Logic Test Complete!');
};

testAdminLogic();





