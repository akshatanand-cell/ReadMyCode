import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-indigo max-w-none">
        <p className="text-gray-500 mb-6">Last updated: August 2026</p>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            We collect information you provide directly, including your name, email address, and 
            GitHub repository URLs. We also collect usage data to improve our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
            <li>To provide and maintain our documentation generation service</li>
            <li>To process and analyze repositories you submit</li>
            <li>To send you updates and notifications about your analyses</li>
            <li>To improve our AI models and service quality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            Repository contents are processed in-memory and not stored permanently. Analysis results 
            are retained for 30 days unless you choose to save them. Account information is retained 
            until you delete your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement industry-standard security measures including encryption in transit (TLS), 
            secure authentication, and regular security audits. However, no method of transmission 
            over the Internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to access, correct, or delete your personal information. You can 
            also request a copy of your data or object to certain processing activities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Third-Party Services</h2>
          <p className="text-gray-600 leading-relaxed">
            We use GitHub API for repository access and third-party AI services for documentation 
            generation. These services have their own privacy policies.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          Questions? <Link to="/help" className="text-indigo-600 hover:underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
}