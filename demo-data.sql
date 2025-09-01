-- Demo Data for Message Management Testing

-- Insert sample admin users (if not exists)
INSERT INTO admin_users (id, email, role) 
VALUES 
  (gen_random_uuid(), 'admin@trinexa.com', 'super_admin'),
  (gen_random_uuid(), 'content@trinexa.com', 'content_admin'),
  (gen_random_uuid(), 'hr@trinexa.com', 'recruitment_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample demo bookings
INSERT INTO demo_bookings (name, email, company, phone, product_interest, message, preferred_date, status) 
VALUES 
  ('John Smith', 'john.smith@example.com', 'TechCorp Inc', '+1-555-0101', 'AI Solutions', 'Interested in AI automation solutions', '2025-02-01', 'pending'),
  ('Sarah Johnson', 'sarah.j@businesstech.com', 'BusinessTech LLC', '+1-555-0102', 'Business Intelligence', 'Need BI dashboard for our company', '2025-02-02', 'scheduled'),
  ('Mike Chen', 'mike.chen@startupxyz.com', 'StartupXYZ', '+1-555-0103', 'Enterprise Solutions', 'Looking for enterprise-grade solutions', '2025-02-03', 'pending'),
  ('Emily Davis', 'emily.davis@retailplus.com', 'RetailPlus', '+1-555-0104', 'AI Solutions', 'Want to integrate AI in retail operations', '2025-02-04', 'completed'),
  ('David Wilson', 'dwilson@manufacturing.com', 'ManufacturingCo', '+1-555-0105', 'Enterprise Solutions', 'Need custom enterprise solution', '2025-02-05', 'pending');

-- Insert sample general applications
INSERT INTO general_applications (name, email, phone, resume_url, cover_letter, portfolio_url, linkedin_url, status) 
VALUES 
  ('Alice Brown', 'alice.brown@email.com', '+1-555-0201', 'https://example.com/resume1.pdf', 'Passionate about AI and software development', 'https://portfolio1.com', 'https://linkedin.com/in/alicebrown', 'pending'),
  ('Robert Garcia', 'robert.garcia@email.com', '+1-555-0202', 'https://example.com/resume2.pdf', 'Experienced full-stack developer seeking new opportunities', 'https://portfolio2.com', 'https://linkedin.com/in/robertgarcia', 'shortlisted'),
  ('Lisa Wang', 'lisa.wang@email.com', '+1-555-0203', 'https://example.com/resume3.pdf', 'UI/UX designer with 5 years experience', 'https://portfolio3.com', 'https://linkedin.com/in/lisawang', 'pending'),
  ('James Miller', 'james.miller@email.com', '+1-555-0204', 'https://example.com/resume4.pdf', 'Data scientist interested in AI research', 'https://portfolio4.com', 'https://linkedin.com/in/jamesmiller', 'rejected'),
  ('Maria Rodriguez', 'maria.rodriguez@email.com', '+1-555-0205', 'https://example.com/resume5.pdf', 'Product manager with enterprise software experience', 'https://portfolio5.com', 'https://linkedin.com/in/mariarodriguez', 'pending');

-- Insert sample message templates
INSERT INTO message_templates (name, category, subject, content, variables, created_by) 
VALUES 
  (
    'Welcome to Demo',
    'daily',
    'Welcome to {company_name} - Your Demo is Confirmed!',
    'Dear {recipient_name},

Thank you for scheduling a demo with {company_name}! We''re excited to show you how our solutions can benefit your business.

Demo Details:
- Date: {demo_date}
- Time: {demo_time}
- Product: {product_interest}

Our team will reach out to you shortly with meeting details.

Best regards,
{company_name} Team

Need help? Contact us at {support_email}',
    ARRAY['recipient_name', 'demo_date', 'demo_time', 'product_interest'],
    (SELECT id FROM admin_users WHERE email = 'admin@trinexa.com' LIMIT 1)
  ),
  (
    'Job Application Received',
    'weekly',
    'Application Received - {company_name} Careers',
    'Dear {recipient_name},

Thank you for your interest in joining {company_name}! We have received your application and our team is currently reviewing it.

Application Details:
- Position: {position}
- Submitted: {current_date}
- Application ID: {application_id}

We will review your application and get back to you within 5-7 business days.

Best regards,
{company_name} Recruitment Team

Questions? Email us at hr@trinexa.com',
    ARRAY['recipient_name', 'position', 'application_id'],
    (SELECT id FROM admin_users WHERE email = 'hr@trinexa.com' LIMIT 1)
  ),
  (
    'Monthly Newsletter',
    'monthly',
    '{company_name} Newsletter - {current_date}',
    'Hello {recipient_name},

Welcome to the {company_name} monthly newsletter!

This Month''s Highlights:
🚀 New AI Solutions launched
📈 Business Intelligence updates
💼 Enterprise feature enhancements
🎯 Success stories from our clients

Stay tuned for more updates and innovations.

Visit our website: {website_url}

Best regards,
The {company_name} Team

Unsubscribe: {unsubscribe_link}',
    ARRAY['recipient_name', 'unsubscribe_link'],
    (SELECT id FROM admin_users WHERE email = 'content@trinexa.com' LIMIT 1)
  ),
  (
    'System Maintenance Notice',
    'custom',
    'Scheduled Maintenance - {company_name} Services',
    'Dear Valued Customer,

We will be performing scheduled maintenance on our systems:

Maintenance Window:
- Date: {maintenance_date}
- Time: {maintenance_time}
- Duration: Approximately 2 hours

During this time, you may experience temporary service interruptions. We apologize for any inconvenience.

Thank you for your patience.

{company_name} Technical Team
{support_email}',
    ARRAY['maintenance_date', 'maintenance_time'],
    (SELECT id FROM admin_users WHERE email = 'admin@trinexa.com' LIMIT 1)
  ),
  (
    'Product Update Announcement',
    'custom',
    'Exciting Updates Coming to {company_name}!',
    'Hello {recipient_name},

We''re thrilled to announce exciting new updates to our platform!

New Features:
✨ Enhanced AI capabilities
🔧 Improved user interface
📊 Advanced analytics dashboard
🔒 Enhanced security features

These updates will be rolled out on {update_date}.

Learn more about these features on our website: {website_url}

Questions? We''re here to help at {support_email}

Best regards,
{company_name} Product Team',
    ARRAY['recipient_name', 'update_date'],
    (SELECT id FROM admin_users WHERE email = 'content@trinexa.com' LIMIT 1)
  );

-- Insert some sample scheduled messages
INSERT INTO scheduled_messages (subject, content, recipient_type, recipient_ids, scheduled_for, status, created_by)
VALUES 
  (
    'Welcome Demo Confirmation',
    'Thank you for scheduling a demo with Trinexa! We will contact you soon with meeting details.',
    'demo_requesters',
    ARRAY[]::text[],
    (CURRENT_TIMESTAMP + INTERVAL '2 hours')::timestamptz,
    'pending',
    (SELECT id FROM admin_users WHERE email = 'admin@trinexa.com' LIMIT 1)
  ),
  (
    'Weekly Job Application Update',
    'This week we received several new applications. Our HR team is reviewing them.',
    'admin_users',
    ARRAY[]::text[],
    (CURRENT_TIMESTAMP + INTERVAL '1 day')::timestamptz,
    'pending',
    (SELECT id FROM admin_users WHERE email = 'hr@trinexa.com' LIMIT 1)
  ),
  (
    'Monthly Newsletter - February 2025',
    'Welcome to our monthly newsletter with updates on new features and company news.',
    'all',
    ARRAY[]::text[],
    (CURRENT_TIMESTAMP + INTERVAL '3 days')::timestamptz,
    'pending',
    (SELECT id FROM admin_users WHERE email = 'content@trinexa.com' LIMIT 1)
  );

-- Insert some sample sent messages
INSERT INTO admin_messages (subject, content, recipient_type, recipient_ids, sent_by)
VALUES 
  (
    'System Maintenance Complete',
    'Our scheduled maintenance has been completed successfully. All services are now fully operational.',
    'all',
    ARRAY[]::text[],
    (SELECT id FROM admin_users WHERE email = 'admin@trinexa.com' LIMIT 1)
  ),
  (
    'New Demo Requests This Week',
    'Summary of new demo requests received this week.',
    'admin_users',
    ARRAY[]::text[],
    (SELECT id FROM admin_users WHERE email = 'admin@trinexa.com' LIMIT 1)
  ),
  (
    'Job Application Status Update',
    'Updates on recent job applications and hiring decisions.',
    'job_applicants',
    ARRAY[]::text[],
    (SELECT id FROM admin_users WHERE email = 'hr@trinexa.com' LIMIT 1)
  );
