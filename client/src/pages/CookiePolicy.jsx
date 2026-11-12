import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Settings, CheckCircle2, Lock } from 'lucide-react';

export default function CookiePolicy() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-settings'));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      {/* Header Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Transparent Privacy
        </span>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          Zero Tracking Ads
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-3">
        Cookie Policy
      </h1>
      <p className="text-sm text-text-secondary mb-10 leading-relaxed">
        Effective date: November 2026. This policy explains what cookies are, how ReadMyCode uses them, and how you can manage your preferences.
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Cookie className="w-4 h-4 text-primary" />
            <h2>1. What Are Cookies?</h2>
          </div>
          <p>
            Cookies and browser local storage items are small text files or key-value entries stored in your web browser. They allow web applications to maintain session state, authenticate authorized users, remember interface preferences (such as Dark/Light theme), and measure core performance.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2>2. Categories of Cookies We Use</h2>
          </div>

          <div className="space-y-4 pt-2">
            {/* Strictly Necessary */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Category 1: Strictly Necessary (Always Active)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Essential
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                These items are technically required for ReadMyCode to operate. They enable secure authentication (JWT access token), CSRF security protection, account session persistence across tabs, and your cookie consent preference.
              </p>
              <table className="w-full text-[11px] text-text-secondary border-t border-border mt-2 pt-2">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th className="py-1">Cookie / Key</th>
                    <th className="py-1">Purpose</th>
                    <th className="py-1">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-1 font-mono text-emerald-400">token</td>
                    <td className="py-1">Encrypted JWT user authentication session</td>
                    <td className="py-1">7 days</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-emerald-400">rmc_cookie_consent</td>
                    <td className="py-1">Stores your cookie consent choice</td>
                    <td className="py-1">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-emerald-400">theme</td>
                    <td className="py-1">Dark/Light interface visual appearance</td>
                    <td className="py-1">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance & Analytics */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  Category 2: Functional & Anonymized Performance
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-background-secondary text-text-muted border border-border font-mono">
                  Optional
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                We collect aggregate, privacy-preserving performance metrics (such as page load speeds, error rates, and API latency via Vercel Speed Insights). We do <strong className="text-text-primary">not</strong> use third-party behavioral advertising networks or tracking pixels.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2>3. Zero Third-Party Advertising Trackers</h2>
          </div>
          <p>
            ReadMyCode does <strong className="text-text-primary">not sell your personal data</strong>, and we do not host advertising cookies, Facebook pixels, or Google Ads cross-site trackers. Your browsing and repository activities are never monetized through ad brokers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-base">
            <Settings className="w-4 h-4 text-primary" />
            <h2>4. How to Manage Your Cookie Preferences</h2>
          </div>
          <p>
            You can customize your cookie preferences on ReadMyCode at any time:
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={openCookiePreferences}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs hover:bg-emerald-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Open Cookie Preference Center</span>
            </button>
          </div>
          <p className="text-xs text-text-muted pt-2">
            You can also block or delete cookies through your browser settings. Note that disabling Strictly Necessary cookies will prevent you from signing in to your account.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-text-primary">
            5. Contact Privacy Office
          </h2>
          <p>
            If you have questions about our use of cookies or privacy practices, contact our team at{' '}
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
