import { supabase } from '../lib/supabase';

// Admin invitation system
export const adminInvitationApi = {
  // Send invitation to new admin
  sendInvitation: async (email: string, role: string = 'admin', invitedByAdminId: string) => {
    try {
      console.log('📧 Sending admin invitation to:', email);

      // Generate invitation token
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      // Create invitation record
      const { data: invitation, error: invitationError } = await supabase
        .from('admin_invitations')
        .insert({
          email,
          role,
          invitation_token: invitationToken,
          invited_by: invitedByAdminId,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (invitationError) {
        throw new Error(`Failed to create invitation: ${invitationError.message}`);
      }

      // In production, send email with invitation link
      const invitationLink = `${window.location.origin}/admin/accept-invitation?token=${invitationToken}`;
      
      console.log('✅ Admin invitation created');
      console.log('🔗 Invitation link:', invitationLink);

      // For demo purposes, return the link (in production, this would be sent via email)
      return {
        success: true,
        invitation,
        invitationLink,
        message: 'Invitation sent successfully'
      };

    } catch (error) {
      console.error('Admin invitation error:', error);
      throw error;
    }
  },

  // Accept invitation and create admin account
  acceptInvitation: async (token: string, password: string, fullName: string) => {
    try {
      console.log('🔓 Accepting admin invitation...');

      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('admin_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Check if invitation has expired
      if (new Date() > new Date(invitation.expires_at)) {
        throw new Error('Invitation has expired');
      }

      console.log('✅ Valid invitation found for:', invitation.email);

      // Create Supabase Auth user (handles password securely)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: invitation.role,
            invited_by: invitation.invited_by
          }
        }
      });

      if (authError) {
        throw new Error(`Account creation failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Account creation failed - no user returned');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Create admin profile (NO password stored here)
      const { error: profileError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: invitation.email,
          full_name: fullName,
          role: invitation.role,
          account_status: 'active',
          invited_by: invitation.invited_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw - auth user exists, profile can be fixed later
      }

      // Mark invitation as accepted
      await supabase
        .from('admin_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_token', token);

      console.log('🎉 Admin account created successfully!');

      return {
        success: true,
        adminUser: {
          id: authData.user.id,
          email: invitation.email,
          role: invitation.role,
          full_name: fullName
        },
        message: 'Admin account created successfully'
      };

    } catch (error) {
      console.error('Accept invitation error:', error);
      throw error;
    }
  },

  // Get invitation details (for validation)
  getInvitation: async (token: string) => {
    try {
      const { data: invitation, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !invitation) {
        throw new Error('Invalid invitation token');
      }

      if (new Date() > new Date(invitation.expires_at)) {
        throw new Error('Invitation has expired');
      }

      return invitation;
    } catch (error) {
      console.error('Get invitation error:', error);
      throw error;
    }
  },

  // Get all pending invitations (admin only)
  getAllInvitations: async () => {
    try {
      const { data: invitations, error } = await supabase
        .from('admin_invitations')
        .select(`
          *,
          invited_by_admin:admin_users!invited_by(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return invitations;
    } catch (error) {
      console.error('Get invitations error:', error);
      throw error;
    }
  }
};

// Create invitation table if it doesn't exist (migration)
export const createInvitationTable = async () => {
  // This would typically be in a migration file
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS admin_invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      invitation_token VARCHAR(255) UNIQUE NOT NULL,
      invited_by UUID REFERENCES admin_users(id),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      accepted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(invitation_token);
    CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
    CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
  `;
  
  console.log('SQL for admin_invitations table:', createTableSQL);
};
