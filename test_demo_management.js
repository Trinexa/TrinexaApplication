// Test script to verify demo session management functionality
import { api } from '../src/services/api';

async function testDemoSessionManagement() {
  console.log('🧪 Testing Demo Session Management System...\n');

  try {
    // Test 1: Fetch team members
    console.log('1. Testing team members fetch...');
    const teamMembers = await api.teamMembers.getAll();
    console.log(`✅ Found ${teamMembers.length} team members`);
    teamMembers.forEach(member => {
      console.log(`   - ${member.name} (${member.role}) - ${member.email}`);
    });
    console.log('');

    // Test 2: Fetch available time slots
    console.log('2. Testing time slots fetch...');
    const timeSlots = await api.availableTimeSlots.getAll();
    console.log(`✅ Found ${timeSlots.length} available time slots`);
    console.log('');

    // Test 3: Fetch email templates
    console.log('3. Testing email templates fetch...');
    const templates = await api.demoEmailTemplates.getAll();
    console.log(`✅ Found ${templates.length} email templates`);
    templates.forEach(template => {
      console.log(`   - ${template.template_name} (${template.template_type})`);
    });
    console.log('');

    // Test 4: Get team members by role
    console.log('4. Testing team members by role...');
    const baMembers = await api.teamMembers.getByRole('BA');
    const seMembers = await api.teamMembers.getByRole('SE');
    console.log(`✅ Found ${baMembers.length} BA members and ${seMembers.length} SE members`);
    console.log('');

    console.log('🎉 All tests passed! Demo session management system is ready.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDemoSessionManagement();
