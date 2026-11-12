import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Database, Server, Trash2, Key, Building2, UserCheck, Cookie } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      {/* Header Badge */}
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
      <p className="text-sm text-text-secondary mb-10 leading-relaxed">
        Effective date: November 2026. This policy details how ReadMyCode collects, safeguards, and processes developer data and codebases.
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1: Business Details & Data Controller */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Building2 className="w-4 h-4 text-primary" />
            <h2>1. Data Controller & Business Identification</h2>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
            <p><strong className="text-text-primary">Data Controller:</strong> ReadMyCode, operated by Akshat Anand</p>
            <p><strong className="text-text-primary">Operational Location:</strong> Bengaluru, Karnataka, India / Remote</p>
            <p><strong className="text-text-primary">Privacy Office:</strong> <a href="mailto:privacy@readmycode.dev" className="text-primary hover:underline">privacy@readmycode.dev</a></p>
            <p><strong className="text-text-primary">Data Protection Inquiries:</strong> <a href="mailto:dpo@readmycode.dev" className="text-primary hover:underline">dpo@readmycode.dev</a></p>
          </div>
        </section>

        {/* Section 2: Data Minimization */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Lock className="w-4 h-4 text-primary" />
            <h2>2. Strict Data Minimization (Data Collected Only as Needed)</h2>
          </div>
          <p>
            We strictly enforce the principle of data minimization under GDPR Article 5(1)(c). We collect only what is strictly necessary to perform codebase analysis:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>
              <strong className="text-text-primary">Account Data:</strong> Name, email address, password hash (via bcrypt with 10 salt rounds), and avatar URL (if provided by GitHub).
            </li>
            <li>
              <strong className="text-text-primary">OAuth Tokens:</strong> Encrypted GitHub OAuth tokens (stored using authenticated AES-256-GCM) with strictly read-only permissions (<code className="text-primary font-mono text-xs">read:user, public_repo</code>).
            </li>
            <li>
              <strong className="text-text-primary">Temporary Analysis Artifacts:</strong> Cloned repositories and syntax trees held in volatile server memory for the duration of the analysis job (purged upon completion).
            </li>
            <li>
              <strong className="text-text-primary">Zero Unneeded Data:</strong> We do <strong className="text-text-primary">not</strong> collect phone numbers, physical home addresses, government IDs, biometric data, or financial banking details (all payments are handled via Stripe).
            </li>
          </ul>
        </section>

        {/* Section 3: Age Restriction & Kids Privacy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h2>3. Children's Privacy (COPPA & GDPR-K Compliance)</h2>
          </div>
          <p>
            ReadMyCode is an engineering tool intended for developers aged 13 and older (or 16+ in the European Economic Area / UK). We do not knowingly solicit or collect personal data from minors under these statutory thresholds. If we discover that personal data of a child under 13/16 has been processed without parental consent, we will immediately take steps to permanently delete that data from our production databases.
          </p>
        </section>

        {/* Section 4: Token Encryption (AES-256-GCM) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Key className="w-4 h-4 text-amber-400" />
            <h2>4. Encryption of GitHub Tokens at Rest (AES-256-GCM)</h2>
          </div>
          <p>
            Security of third-party credentials is a zero-compromise priority. All GitHub OAuth access tokens and Personal Access Tokens stored in our database are encrypted at rest using industry-standard <strong className="text-text-primary">AES-256-GCM</strong> with unique per-token initialization vectors and cryptographic authentication tags. Tokens are decrypted transiently in volatile application memory only when executing authorized GitHub API calls requested directly by you.
          </p>
        </section>

        {/* Section 5: Ephemeral Ingestion & Secrets Redaction */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2>5. Ephemeral Code Processing & Automated Secrets Redactor</h2>
          </div>
          <p>
            <strong className="text-text-primary">Ephemeral Ingestion:</strong> When you analyze a repository, files are cloned or unzipped into temporary, isolated serverless scratch directories (<code className="text-text-primary font-mono text-xs">/tmp</code>). Immediately after AST generation and documentation production, all raw repository code is permanently deleted from server storage.
          </p>
          <p>
            <strong className="text-text-primary">Automated Secrets & PII Redactor:</strong> Prior to transmitting code signatures or syntax chunks to downstream AI models, ReadMyCode applies automated regex scrubbing filters to detect and redact sensitive patterns, including AWS access keys, GitHub tokens, Slack secrets, Stripe private keys, JWTs, private RSA/EC keys, password assignments, and personal email addresses.
          </p>
          <p>
            <strong className="text-text-primary">Zero Model Training:</strong> Your code is never retained or utilized to train base foundation AI models.
          </p>
        </section>

        {/* Section 6: Third-Party Subprocessors SDK Audit */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Server className="w-4 h-4 text-primary" />
            <h2>6. Third-Party SDK & Subprocessor Audit</h2>
          </div>
          <p>
            We maintain a complete, transparent audit of all third-party services and subprocessors:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block">Vercel Inc. (USA)</span>
              <span className="text-[11px] text-text-muted mt-1 block">Edge CDN hosting and serverless function execution.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block">MongoDB Atlas (AWS USA)</span>
              <span className="text-[11px] text-text-muted mt-1 block">Encrypted document database for user accounts and generated markdown specs.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block">xAI & Groq Inc. (USA)</span>
              <span className="text-[11px] text-text-muted mt-1 block">LLM inference APIs (Grok / Llama) strictly for technical documentation generation. Zero training on user code.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block">Stripe Inc. (USA)</span>
              <span className="text-[11px] text-text-muted mt-1 block">PCI DSS Level 1 certified billing provider for paid subscriptions.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block">Resend Inc. (USA)</span>
              <span className="text-[11px] text-text-muted mt-1 block">Transactional email service for OTP verification, password resets, and opt-in newsletters.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="font-semibold text-text-primary block">GitHub Inc. (USA)</span>
              <span className="text-[11px] text-text-muted mt-1 block">OAuth authorization provider and git repository provider.</span>
            </div>
          </div>
        </section>

        {/* Section 7: User Rights & Data Deletion */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Trash2 className="w-4 h-4 text-error" />
            <h2>7. GDPR / CCPA Rights & Self-Serve Data Deletion (Art. 17)</h2>
          </div>
          <p>
            You have full statutory rights over your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>
              <strong className="text-text-primary">Self-Serve Right to Erasure:</strong> You can delete any repository, generated documentation, or your <strong className="text-text-primary">entire account and all associated data in 1 click</strong> via your <Link to="/profile" className="text-primary hover:underline">Profile Settings</Link>. Deletion permanently removes your profile, encrypted credentials, and specs from MongoDB Atlas.
            </li>
            <li>
              <strong className="text-text-primary">Manual Deletion Requests:</strong> Unauthenticated visitors or guests can request permanent deletion of IP telemetry records by emailing <a href="mailto:privacy@readmycode.dev" className="text-primary hover:underline">privacy@readmycode.dev</a> with the subject line &ldquo;GDPR Erasure Request&rdquo;. We fulfill all requests within 30 days without charge.
            </li>
            <li>
              <strong className="text-text-primary">Data Portability:</strong> You can download all your generated specifications at any time in unified Markdown (.md) format.
            </li>
          </ul>
        </section>

        {/* Section 8: Cookies */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Cookie className="w-4 h-4 text-emerald-400" />
            <h2>8. Cookie & Local Storage Disclosure</h2>
          </div>
          <p>
            We use strictly necessary cookies for authentication and session management. We do not use third-party advertising cookies. For full details on our cookies and to adjust your preferences, visit our dedicated{' '}
            <Link to="/cookies" className="text-primary hover:underline font-medium">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* Section 9: Inquiries */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-text-primary">
            9. Privacy Inquiries & Data Protection Officer
          </h2>
          <p>
            For any questions regarding this policy or data processing, please contact{' '}
            <a href="mailto:privacy@readmycode.dev" className="text-primary hover:underline font-medium">
              privacy@readmycode.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
