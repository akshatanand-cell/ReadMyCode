import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Database, Server, Trash2, Key } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Data Governance & Privacy Constitution
        </span>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          GDPR & CCPA Compliant
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-3">
        Privacy Policy
      </h1>
      <p className="text-sm text-text-secondary mb-10">
        Effective date: October 2026. This policy details how ReadMyCode collects, safeguards, and processes developer data and codebases.
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Lock className="w-4 h-4 text-primary" />
            <h2>1. Information We Collect</h2>
          </div>
          <p>
            We adhere strictly to the principle of data minimization. We collect only information necessary to deliver documentation generation services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>
              <strong className="text-text-primary">Account Data:</strong> Name, email address, avatar URL, and GitHub account handle when you register or sign in via GitHub OAuth.
            </li>
            <li>
              <strong className="text-text-primary">Authentication Credentials:</strong> Passwords hashed with bcrypt (minimum 10 salt rounds). If you connect GitHub, OAuth access tokens are encrypted at rest.
            </li>
            <li>
              <strong className="text-text-primary">Network Telemetry:</strong> Anonymized IP addresses for rate limiting and fraud prevention, system uptime metrics, and standard HTTP headers.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Key className="w-4 h-4 text-amber-400" />
            <h2>2. Encryption of GitHub Tokens at Rest (AES-256-GCM)</h2>
          </div>
          <p>
            Security of third-party credentials is a zero-compromise priority. All GitHub OAuth access tokens and Personal Access Tokens stored in our database are encrypted at rest using industry-standard <strong className="text-text-primary">AES-256-GCM</strong> (Galois/Counter Mode) with unique per-token initialization vectors and cryptographic authentication tags.
          </p>
          <p>
            Tokens are decrypted transiently in volatile application memory only when executing authorized GitHub API calls requested directly by you.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2>3. Ephemeral Code Processing & Automated Secrets Scrubbing</h2>
          </div>
          <p>
            <strong className="text-text-primary">Ephemeral Ingestion:</strong> When you analyze a repository, files are cloned or unzipped into temporary, isolated serverless scratch directories (<code className="text-text-primary font-mono text-xs">/tmp</code>). Immediately after AST generation and documentation production, all raw repository code is permanently deleted from server storage.
          </p>
          <p>
            <strong className="text-text-primary">Automated Secrets & PII Redactor:</strong> Prior to transmitting code signatures or syntax chunks to downstream AI models, ReadMyCode applies automated regex scrubbing filters to detect and redact sensitive patterns, including AWS access keys, GitHub tokens, Slack secrets, Stripe private keys, JWTs, private RSA/EC keys, password assignments, and personal email addresses.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Server className="w-4 h-4 text-primary" />
            <h2>4. Authorized Third-Party Subprocessors</h2>
          </div>
          <p>
            To deliver global high-availability performance, ReadMyCode contracts with reputable enterprise subprocessors that adhere to strict data security standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block text-xs">Vercel Inc.</span>
              <span className="text-[11px] text-text-muted">Edge hosting, static CDN delivery, and serverless compute execution.</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block text-xs">MongoDB Atlas</span>
              <span className="text-[11px] text-text-muted">Managed cloud database for user profiles and saved documentation specifications.</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block text-xs">xAI & Groq Inc.</span>
              <span className="text-[11px] text-text-muted">Large language model inference (Grok / Llama) for documentation synthesis. No model training on user payloads.</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block text-xs">GitHub Inc.</span>
              <span className="text-[11px] text-text-muted">Developer OAuth identity verification and authorized repository fetching.</span>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Trash2 className="w-4 h-4 text-error" />
            <h2>5. GDPR & CCPA Compliance: User Rights & Data Deletion</h2>
          </div>
          <p>
            Regardless of your geographic jurisdiction, ReadMyCode extends comprehensive data rights consistent with the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>
              <strong className="text-text-primary">Right to Erasure (Purge):</strong> You can delete any analyzed repository or delete your entire account permanently at any time through the dashboard or account settings. Deleting your account immediately erases all profile records, encrypted tokens, and generated docs from MongoDB Atlas.
            </li>
            <li>
              <strong className="text-text-primary">Right of Access & Portability:</strong> You can export all your generated documentation in unified Markdown format at any time using the one-click Download Specs action.
            </li>
            <li>
              <strong className="text-text-primary">No Sale of Personal Data:</strong> We do not sell, rent, or monetize your personal information or codebase data to data brokers or advertising networks.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Database className="w-4 h-4 text-primary" />
            <h2>6. Data Retention Policy</h2>
          </div>
          <p>
            Raw source code is retained for zero (0) seconds following the completion of static analysis. Account profiles, generated Markdown docs, and architectural diagrams are retained only as long as your account remains active. Upon initiating account deletion, all data is expunged within 24 hours.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            7. Contact Data Protection Officer
          </h2>
          <p>
            For privacy inquiries, GDPR data requests, or compliance auditing questions, please submit a request through the{' '}
            <Link to="/help" className="text-primary hover:underline">
              support center
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
