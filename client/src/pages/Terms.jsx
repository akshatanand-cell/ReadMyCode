import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-text-primary">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Legal Agreement
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-medium">
          Draft for Review
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-3">
        Terms of Service
      </h1>
      <p className="text-sm text-text-secondary mb-10">
        Effective date: October 2026. This draft outlines operational terms for ReadMyCode.
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-text-secondary">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            1. Nature of the Service
          </h2>
          <p>
            ReadMyCode provides automated codebase analysis. By submitting a GitHub repository URL or uploading an archive, the service inspects abstract syntax trees, directory structures, and code signatures to generate project documentation, architecture diagrams, and function indices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            2. Code Processing and Ownership
          </h2>
          <p>
            You retain all rights, ownership, and intellectual property in the source code you submit. You grant ReadMyCode a temporary, non-exclusive license solely to parse, analyze, and generate technical documentation for your session.
          </p>
          <p>
            Source code is processed in temporary scratch storage and is not sold, redistributed, or used to train third-party public foundation models without explicit authorization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            3. Accuracy of Generated Specifications
          </h2>
          <p>
            Documentation, architecture diagrams, flowcharts, and function explanations are generated via automated static analysis and AI interpretation. While designed for high precision, engineering teams must review generated specifications before deploying critical production systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            4. User Responsibilities
          </h2>
          <p>
            You agree to submit only repositories for which you possess proper authorization or that are licensed for open inspection. You agree not to upload malicious binaries, exploit payloads, or copyrighted proprietary material without permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            5. Limitation of Liability
          </h2>
          <p>
            ReadMyCode is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted by applicable law, ReadMyCode and its maintainers are not liable for indirect, incidental, or consequential damages resulting from service interruptions or reliance on generated documentation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            6. Inquiries and Revisions
          </h2>
          <p>
            For questions regarding these draft terms or data practices, contact{' '}
            <Link to="/help" className="text-primary hover:underline">
              support
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}