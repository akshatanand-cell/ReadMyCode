import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How does ReadMyCode work?',
    a: 'Simply paste a GitHub repository URL or upload a ZIP file. Our AI analyzes the code structure, parses ASTs, and generates comprehensive documentation including READMEs, API docs, flowcharts, architecture diagrams, function explanations, and debugging help.'
  },
  {
    q: 'What programming languages are supported?',
    a: 'We support JavaScript, TypeScript, Python, Java, Go, Rust, and Ruby. The AI adapts its analysis based on the detected language and framework.'
  },
  {
    q: 'Is my code kept private?',
    a: 'Yes. Repository contents are processed in real-time and not stored permanently on our servers. Analysis results are only accessible to you and are automatically deleted after 30 days unless saved.'
  },
  {
    q: 'Can I edit the generated documentation?',
    a: 'Absolutely! All generated documentation is editable. You can modify the README, adjust API docs, refine flowcharts, and customize explanations before exporting.'
  },
  {
    q: 'What is the Debugger feature?',
    a: 'The Debugger accepts error messages or stack traces and uses AI to suggest fixes, explain the root cause, and provide code corrections based on your repository context.'
  },
  {
    q: 'How accurate is the AI-generated documentation?',
    a: 'While our AI is highly capable, we recommend reviewing all generated content. The accuracy depends on code quality, comments, and structure. Complex or undocumented code may require manual refinement.'
  }
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
      <p className="text-gray-500 mb-8">Find answers to common questions about ReadMyCode</p>

      {/* Search */}
      <div className="relative mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search help articles..."
          className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { title: 'Getting Started', icon: '🚀', desc: 'First steps with ReadMyCode' },
          { title: 'API Reference', icon: '📚', desc: 'Backend API documentation' },
          { title: 'Troubleshooting', icon: '🔧', desc: 'Common issues and fixes' },
        ].map(link => (
          <div key={link.title} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer">
            <div className="text-2xl mb-2">{link.icon}</div>
            <h3 className="font-semibold text-gray-900">{link.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {filteredFaqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
            >
              <span className="font-medium text-gray-900">{faq.q}</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No results found for "{searchQuery}". Try a different search term.
        </div>
      )}

      {/* Contact */}
      <div className="mt-12 bg-indigo-50 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">Still need help?</h3>
        <p className="text-indigo-700 mb-4">Our team is here to assist you</p>
        <a 
          href="mailto:support@readmycode.dev" 
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Support
        </a>
      </div>
    </div>
  );
}