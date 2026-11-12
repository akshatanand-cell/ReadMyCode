import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShieldCheck, Clock, HelpCircle, CheckCircle, RefreshCcw } from 'lucide-react';

export default function Refund() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      {/* Header Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Fair Billing Guarantee
        </span>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          14-Day Money-Back Guarantee
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-3">
        Refund & Cancellation Policy
      </h1>
      <p className="text-sm text-text-secondary mb-10 leading-relaxed">
        Effective date: November 2026. At ReadMyCode, we believe in honest software, zero dark patterns, and completely transparent billing.
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2>1. 14-Day Full Refund Guarantee</h2>
          </div>
          <p>
            If you subscribe to the <strong className="text-text-primary">Pro Engineer ($12/month)</strong> or <strong className="text-text-primary">Team Plan ($49/month)</strong> and are not fully satisfied with our AI documentation or architecture generator, you may request a <strong className="text-text-primary">100% full refund within 14 days</strong> of your initial purchase date. No questions asked and no retention loops.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <DollarSign className="w-4 h-4 text-primary" />
            <h2>2. No Hidden Fees & Transparent Pricing</h2>
          </div>
          <p>
            We strictly enforce a <strong className="text-text-primary">zero hidden fees policy</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>No setup fees, onboarding charges, or early termination penalties.</li>
            <li>All subscription fees are stated clearly in USD before you enter any payment information.</li>
            <li>Free tier accounts are free forever and do not require a credit card.</li>
            <li>We do not utilize drip pricing, auto-enrolling add-ons, or surprise price increases.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <RefreshCcw className="w-4 h-4 text-emerald-400" />
            <h2>3. Cancellation Anytime with 1 Click</h2>
          </div>
          <p>
            You can cancel your subscription at any time directly from your account settings with a single click. When you cancel:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>You will retain full Pro access until the conclusion of your current billing period.</li>
            <li>You will never be billed again after the active cycle concludes.</li>
            <li>All your previously generated specifications and repositories remain accessible in your account.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Clock className="w-4 h-4 text-primary" />
            <h2>4. Usage-Based Serverless Compute Caveats</h2>
          </div>
          <p>
            ReadMyCode incurs real-time serverless compute and LLM inference API costs (xAI Grok & Groq Llama) on each repository analysis run. While we honor all legitimate 14-day refund requests in good faith, accounts exhibiting severe bad-faith activity (e.g. scanning hundreds of repositories in bulk and immediately requesting a refund to bypass compute billing) may have refunds reviewed or prorated in accordance with actual compute consumed.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <HelpCircle className="w-4 h-4 text-primary" />
            <h2>5. How to Request a Refund</h2>
          </div>
          <p>
            To initiate a refund, simply send an email from your registered account email address to:
          </p>
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <p className="font-mono text-emerald-400 font-semibold text-xs">
              billing@readmycode.dev
            </p>
            <p className="text-xs text-text-muted">
              Subject: Refund Request - [Your Registered Email]
            </p>
            <p className="text-xs text-text-secondary">
              Our billing support team processes refund requests within <strong className="text-text-primary">24–48 hours</strong>. Funds typically appear on your original payment card within 5–10 business days depending on your banking institution.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-text-primary">
            6. Related Agreements
          </h2>
          <p>
            Please review our{' '}
            <Link to="/terms" className="text-primary hover:underline font-medium">
              Terms of Service
            </Link>
            ,{' '}
            <Link to="/privacy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
            , and{' '}
            <Link to="/cookies" className="text-primary hover:underline font-medium">
              Cookie Policy
            </Link>{' '}
            for full operational and data governance details.
          </p>
        </section>
      </div>
    </div>
  );
}
