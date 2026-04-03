export default function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-cream-50 via-cream-100 to-emerald-50 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Back to Taliya
        </a>

        <h1 className="text-3xl font-bold text-emerald-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-emerald-600/60 mb-8">Last updated: April 2, 2026</p>

        <div className="space-y-6 text-emerald-800/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Overview</h2>
            <p>
              Taliya (&quot;the App&quot;) is a simple dhikr (Islamic remembrance) counter designed to help
              you maintain daily spiritual practice. Your privacy is important to us, and we are committed to
              protecting it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Data Collection</h2>
            <p>
              Taliya does <strong>not</strong> collect, store, or transmit any personal data to external
              servers. The App operates entirely on your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Local Storage</h2>
            <p>
              The App stores your dhikr counts, selected goals, and preferences locally on your device
              using your browser&apos;s built-in localStorage. This data never leaves your device and is
              automatically reset daily to encourage consistent practice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">No Account Required</h2>
            <p>
              Taliya does not require you to create an account, sign in, or provide any personal
              information to use the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">No Analytics or Tracking</h2>
            <p>
              The App does not use any analytics services, tracking pixels, cookies for tracking purposes,
              or advertising frameworks. We do not track your usage patterns or behavior.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">No Third-Party Services</h2>
            <p>
              Taliya does not integrate with any third-party services that could collect your data. The App
              works offline after initial installation and does not make network requests during use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Children&apos;s Privacy</h2>
            <p>
              The App is suitable for users of all ages. Since we do not collect any personal data, there
              are no special concerns regarding children&apos;s privacy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected on this
              page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:agentabudi@zohomail.com" className="text-emerald-600 underline hover:text-emerald-800">
                agentabudi@zohomail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-emerald-200/40 text-center">
          <p className="text-xs text-emerald-600/40">Taliya &mdash; A Digital Tasbih for Presence, Simplicity, and Consistency</p>
        </div>
      </div>
    </div>
  );
}
