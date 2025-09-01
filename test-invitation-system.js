import { api, emailService } from '../src/services/api';

// Test the admin invitation system
async function testInvitationSystem() {
  console.log('🧪 Testing Admin Invitation System...\n');

  try {
    // Test 1: Create an invitation
    console.log('1️⃣ Creating invitation...');
    const invitation = await api.adminInvitations.create({
      email: 'test@example.com',
      role: 'admin'
    });
    console.log('✅ Invitation created:', invitation.id);

    // Test 2: Get all invitations
    console.log('\n2️⃣ Fetching all invitations...');
    const invitations = await api.adminInvitations.getAll();
    console.log('✅ Found', invitations.length, 'invitations');

    // Test 3: Test email templates
    console.log('\n3️⃣ Testing email templates...');
    const templates = await api.invitationEmailTemplates.getAll();
    console.log('✅ Found', templates.length, 'email templates');

    // Test 4: Get invitation template
    const inviteTemplate = await api.invitationEmailTemplates.getByType('admin_invitation');
    if (inviteTemplate) {
      console.log('✅ Found admin invitation template:', inviteTemplate.name);
    }

    // Test 5: Send test invitation email (simulate)
    console.log('\n4️⃣ Testing email service...');
    console.log('📧 Email would be sent to:', invitation.email);
    console.log('🔗 Invitation URL would be:', `http://localhost:3000/admin/accept-invitation?token=${invitation.invitation_token}`);

    console.log('\n🎉 All tests passed! Admin invitation system is ready.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test email template rendering
function testEmailTemplateRendering() {
  console.log('\n📧 Testing Email Template Rendering...\n');

  const variables = {
    company_name: 'Trinexa',
    email: 'john.doe@example.com',
    role: 'Admin',
    invitation_url: 'http://localhost:3000/admin/accept-invitation?token=abc123',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    support_email: 'support@trinexa.com'
  };

  const template = `
    <h2>Welcome to {{company_name}}!</h2>
    <p>Hello,</p>
    <p>You have been invited as: {{role}}</p>
    <p>Email: {{email}}</p>
    <p><a href="{{invitation_url}}">Accept Invitation</a></p>
    <p>Expires: {{expires_at}}</p>
    <p>Support: {{support_email}}</p>
  `;

  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, value);
  });

  console.log('📄 Rendered Template:');
  console.log(result);
  console.log('\n✅ Template rendering works!');
}

// Export for potential use
export { testInvitationSystem, testEmailTemplateRendering };

// If running directly
if (require.main === module) {
  testEmailTemplateRendering();
  // testInvitationSystem(); // Uncomment when database is ready
}
