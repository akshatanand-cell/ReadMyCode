import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Scale, DollarSign, Cpu, FileCheck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
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
      <p className="text-sm text-text-secondary mb-10">
        Last updated: October 2026. Please read these terms carefully before utilizing ReadMyCode (&ldquo;the Service&rdquo;).
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Cpu className="w-4 h-4 text-primary" />
            <h2>1. Nature of the Service & Ephemeral Ingestion</h2>
          </div>
          <p>
            ReadMyCode provides an automated technical documentation and codebase static analysis platform. Upon submitting a public GitHub repository link, uploading an archive, or connecting a GitHub account, our pipeline performs abstract syntax tree (AST) extraction and queries third-party large language models to construct architecture topology, workflow diagrams, API specifications, and README files.
          </p>
          <p>
            <strong className="text-text-primary">Strict Ephemeral Ingestion:</strong> All cloned repositories, uncompressed archives, and intermediate syntax artifacts are processed strictly in ephemeral scratch memory (<code className="text-text-primary font-mono text-xs">/tmp</code>) during the active analysis job. Cloned code and raw source files are immediately purged and unlinked from server disk upon completion or failure of the generation run. Only the resulting generated markdown specifications and structural summaries are retained in your account history.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h2>2. Scope Warranties & Permissible Code Ingestion</h2>
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

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Shield className="w-4 h-4 text-primary" />
            <h2>3. Zero Model Training Guarantee</h2>
          </div>
          <p>
            <strong className="text-text-primary">We do not use customer code to train base AI models.</strong> Any repository code, file signatures, or metadata transmitted through the ReadMyCode pipeline are transitory and used exclusively for real-time inference to generate your requested project specifications. Your proprietary code is never pooled, shared with other users, or repurposed for foundation model pre-training.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2>4. AI Accuracy Disclaimer & User Responsibility</h2>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-2">
            <p className="font-semibold text-amber-100">
              Mandatory AI Output Notice:
            </p>
            <p className="text-xs leading-relaxed">
              Outputs are generated automatically by artificial intelligence algorithms and static analyzers and are provided &ldquo;as-is&rdquo;. ReadMyCode does not warrant or guarantee error-free code analysis, flawless architecture diagrams, complete security detection, or hallucination-free summaries.
            </p>
          </div>
          <p>
            Users and software engineering teams bear sole responsibility for critically reviewing, validating, and testing all AI-generated documentation, architecture maps, and code before applying them to mission-critical or production environments.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Scale className="w-4 h-4 text-primary" />
            <h2>5. Limitation of Financial Liability</h2>
          </div>
          <p>
            To the maximum extent permitted under applicable law, ReadMyCode, its developers, operators, and affiliates shall not be liable for any indirect, punitive, incidental, special, or consequential damages, including loss of profits, data corruption, or operational interruptions resulting from the use or inability to use the Service.
          </p>
          <p>
            <strong className="text-text-primary">Liability Cap:</strong> In all circumstances, ReadMyCode&rsquo;s aggregate maximum financial liability arising out of or related to these terms or the Service is strictly capped at zero dollars ($0.00 USD) for free tier accounts, or the total fees paid by you to ReadMyCode in the twelve (12) months preceding the incident.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2>6. Usage-Based Services & No Refund Policy</h2>
          </div>
          <p>
            ReadMyCode incurs real-time serverless compute, AST parser memory, and AI inference API costs upon initiating repository analysis runs. All paid services, credits, or subscriptions are strictly usage-based. Because computational resources are consumed instantaneously upon job execution, payments and scan fees are non-refundable once an analysis job has been initiated.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            7. Contact & Governance
          </h2>
          <p>
            For questions concerning these terms, licensing warranties, or legal inquiries, please contact our support team at{' '}
            <Link to="/help" className="text-primary hover:underline">
              support portal
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
