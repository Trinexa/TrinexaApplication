import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/register" className="text-green-600 hover:text-green-500 text-sm">
              ← Back to Registration
            </Link>
          </div>

          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> August 6, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Trinexa's services, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                Trinexa provides AI-powered solutions including but not limited to analytics platforms, security solutions, 
                workflow automation, and conversational AI assistants. Our services are designed to help businesses 
                automate processes, gain insights, and drive innovation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To access certain features of our service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to use our services to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Distribute malware, viruses, or other harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use our services for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All content, features, and functionality of our services are owned by Trinexa and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data and Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
              <p className="text-gray-600 leading-relaxed">
                We strive to maintain high availability of our services but cannot guarantee uninterrupted access. 
                We reserve the right to modify, suspend, or discontinue any part of our services at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, Trinexa shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account and access to our services immediately, without prior notice, 
                for any reason, including breach of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes 
                via email or through our service. Continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  <strong>Email:</strong> team.trinexa@gmail.com<br />
                  <strong>Phone:</strong> +94 779 305 395
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;