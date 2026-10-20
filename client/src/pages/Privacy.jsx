import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Data Governance
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-medium">
          Draft for Review
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-3">
        Privacy Policy
      </h1>
      <p className="text-sm text-text-secondary mb-10">
        Effective date: October 2026. This policy describes how ReadMyCode collects, processes, and protects information.
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-text-secondary">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            1. Information Processed
          </h2>
          <p>
            When you register, we collect your name and email address. When you analyze a codebase, we temporarily receive the repository files, directory paths, and source code required to parse abstract syntax trees and generate documentation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            2. In-Memory Processing & Ephemeral Storage
          </h2>
          <p>
            Uploaded project ZIPs and cloned GitHub repositories are unpacked into temporary scratch storage exclusively during analysis. Once the documentation artifacts (README, ARCHITECTURE, AGENTS, TASK BREAKDOWN, flowchart diagrams) are generated, the raw source files are cleared from temporary server disk.
          </p>
          <p>
            Generated documentation artifacts are saved to your account history in MongoDB Atlas so you can access them across sessions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            3. AI Service Interactions
          </h2>
          <p>
            To generate natural-language explanations and Markdown specifications, code snippets and AST metadata are transmitted securely via TLS to third-party AI APIs. These payloads are used strictly for inference to produce your documentation and are not retained by our application for unauthorized secondary purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            4. GitHub Authentication and Tokens
          </h2>
          <p>
            If you connect your GitHub account via OAuth or personal access token, tokens are encrypted and used only to fetch public or authorized repositories on your instruction. We do not write or modify repository code without your explicit instruction.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            5. User Rights and Data Deletion
          </h2>
          <p>
            You may delete your account, saved repositories, and generated documentation at any time from your account settings. Deletion permanently removes all associated database records and cached analysis outputs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            6. Policy Inquiries
          </h2>
          <p>
            If you have questions about privacy practices or data handling, please contact our team via the{' '}
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