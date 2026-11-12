import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Scale, DollarSign, Cpu, FileCheck, Building2, UserCheck, Image } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      {/* Header Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Legal Agreement & Code Ingestion Policy
        </span>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          Effective & Binding
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-3">
        Terms of Service
      </h1>
      <p className="text-sm text-text-secondary mb-10 leading-relaxed">
        Last updated: November 2026. Please read these terms carefully before utilizing ReadMyCode (&ldquo;the Service&rdquo;).
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1: Business Details */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Building2 className="w-4 h-4 text-primary" />
            <h2>1. Identification of Service Provider & Business Entity</h2>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
            <p><strong className="text-text-primary">Service Name:</strong> ReadMyCode AI Codebase Documentation Engine</p>
            <p><strong className="text-text-primary">Operator:</strong> Akshat Anand (Founder & Principal Maintainer)</p>
            <p><strong className="text-text-primary">Registered Operation:</strong> Bengaluru, Karnataka, India / Remote</p>
            <p><strong className="text-text-primary">General Inquiries:</strong> <a href="mailto:support@readmycode.dev" className="text-primary hover:underline">support@readmycode.dev</a></p>
            <p><strong className="text-text-primary">Legal & Compliance Notice:</strong> <a href="mailto:legal@readmycode.dev" className="text-primary hover:underline">legal@readmycode.dev</a></p>
          </div>
        </section>

        {/* Section 2: Age Consent (COPPA / GDPR-K) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h2>2. Minimum Age & Eligibility (COPPA / GDPR-K Compliance)</h2>
          </div>
          <p>
            The Service is intended exclusively for software developers and engineering teams. You must be at least <strong className="text-text-primary">13 years of age</strong> (or <strong className="text-text-primary">16 years of age</strong> if you reside within the European Economic Area or United Kingdom) to create an account or process codebases through ReadMyCode. We do not knowingly collect personal data from children under these age thresholds. If we discover an account registered by an underage user, the account and all associated records will be purged immediately.
          </p>
        </section>

        {/* Section 3: Ephemeral Ingestion & Zero Model Training */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Cpu className="w-4 h-4 text-primary" />
            <h2>3. Ephemeral Code Ingestion & Zero Model Training Guarantee</h2>
          </div>
          <p>
            ReadMyCode provides an automated technical documentation and codebase static analysis platform. Upon submitting a public GitHub repository link, uploading an archive, or connecting a GitHub account, our pipeline performs abstract syntax tree (AST) extraction and queries third-party large language models to construct architecture topology, workflow diagrams, API specifications, and README files.
          </p>
          <p>
            <strong className="text-text-primary">Strict Ephemeral Ingestion:</strong> All cloned repositories, uncompressed archives, and intermediate syntax artifacts are processed strictly in ephemeral scratch memory (<code className="text-text-primary font-mono text-xs">/tmp</code>) during the active analysis job. Cloned code and raw source files are immediately purged and unlinked from server disk upon completion or failure of the generation run. Only the resulting generated markdown specifications and structural summaries are retained in your account history.
          </p>
          <p>
            <strong className="text-text-primary">Zero Model Training:</strong> We explicitly warrant that <strong className="text-text-primary">customer code is never used to train, retrain, fine-tune, or reinforce foundation AI models</strong> (neither by ReadMyCode nor through our downstream inference partners). Code payloads are transitory and used strictly for real-time inference.
          </p>
        </section>

        {/* Section 4: Scope Warranties */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h2>4. Scope Warranties & Permissible Code Submission</h2>
          </div>
          <p>
            By submitting any codebase, repository URL, or project archive to ReadMyCode, you expressly represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>
              You hold the requisite rights, title, licenses, or explicit authorization to process the codebase and inspect its source files.
            </li>
            <li>
              The repository does not contain malicious code, exploits, unlawful surveillance software, or third-party proprietary trade secrets ingested in violation of applicable nondisclosure agreements.
            </li>
            <li>
              Open-source repositories with copyleft provisions (e.g., AGPL/GPL) are processed strictly in accordance with their respective public distribution licenses for static documentation purposes.
            </li>
          </ul>
        </section>

        {/* Section 5: AI Accuracy Disclaimer */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2>5. AI Accuracy Disclaimer & User Responsibility</h2>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-2">
            <p className="font-semibold text-amber-100">
              Mandatory AI Output Notice:
            </p>
            <p className="text-xs leading-relaxed">
              Outputs are generated automatically by artificial intelligence algorithms and static syntax analyzers and are provided &ldquo;as-is&rdquo;. ReadMyCode does not warrant or guarantee error-free code analysis, flawless architecture diagrams, complete security vulnerability detection, or hallucination-free summaries.
            </p>
          </div>
          <p>
            Users and software engineering teams bear sole responsibility for critically reviewing, validating, and testing all AI-generated documentation, architecture maps, and code before applying them to mission-critical or production environments.
          </p>
        </section>

        {/* Section 6: No Hidden Fees & Refund Policy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2>6. No Hidden Fees & 14-Day Refund Policy</h2>
          </div>
          <p>
            All prices on ReadMyCode are transparent: Free ($0), Pro ($12/month), and Team ($49/month). We charge zero hidden fees, zero cancellation fees, and zero setup fees.
          </p>
          <p>
            We honor a <strong className="text-text-primary">14-Day Money-Back Guarantee</strong> for all initial paid subscriptions. For complete terms, see our dedicated{' '}
            <Link to="/refund" className="text-primary hover:underline font-medium">
              Refund & Cancellation Policy
            </Link>
            .
          </p>
        </section>

        {/* Section 7: Limitation of Liability */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Scale className="w-4 h-4 text-primary" />
            <h2>7. Limitation of Financial Liability</h2>
          </div>
          <p>
            To the maximum extent permitted under applicable law, ReadMyCode, its developers, operators, and affiliates shall not be liable for any indirect, punitive, incidental, special, or consequential damages resulting from the use or inability to use the Service.
          </p>
          <p>
            <strong className="text-text-primary">Liability Cap:</strong> In all circumstances, ReadMyCode&rsquo;s aggregate maximum financial liability is strictly capped at zero dollars ($0.00 USD) for free tier accounts, or the total fees paid by you to ReadMyCode in the twelve (12) months preceding the incident.
          </p>
        </section>

        {/* Section 8: Image & Asset Licensing */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Image className="w-4 h-4 text-primary" />
            <h2>8. Creative Asset & Icon Licensing Colophon</h2>
          </div>
          <p>
            All user interface icons throughout ReadMyCode are provided by the <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide Icons</a> library, licensed under the MIT License. All logo vector artwork, badges, preview renders, and typography arrangements are proprietary or original open-source creative works licensed under the ISC / MIT license for ReadMyCode. Zero unlicensed third-party stock photography is used across the application.
          </p>
        </section>

        {/* Section 9: Governance & Contact */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-text-primary">
            9. Contact & Governance
          </h2>
          <p>
            For legal inquiries, scope authorizations, or compliance questions, please contact our team at{' '}
            <a href="mailto:legal@readmycode.dev" className="text-primary hover:underline font-medium">
              legal@readmycode.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
