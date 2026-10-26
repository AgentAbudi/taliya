"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-cream-50 via-cream-100 to-emerald-50 pb-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-emerald-600 text-sm mb-8 hover:text-emerald-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back to Taliya
        </a>

        <h1 className="text-3xl font-semibold text-emerald-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-emerald-600/60 mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-emerald-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Overview</h2>
            <p>
              Taliya is built with privacy as a core principle. We do not collect, store, transmit, or share any
              personal data. Your information stays on your device, period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Data Storage</h2>
            <p>
              All your data â dhikr counts, prayer logs, habit tracking, mood entries, custom habits, and settings
              â is stored locally on your device using your browser&apos;s localStorage. This data never leaves
              your device and is not accessible to us or any third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Data Collection</h2>
            <p>
              We collect <strong>zero</strong> data. Specifically:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-emerald-600">
              <li>No personal information (name, email, phone, etc.)</li>
              <li>No usage analytics or tracking</li>
              <li>No cookies beyond what your browser stores locally</li>
              <li>No advertising identifiers</li>
              <li>No location data</li>
              <li>No health data transmitted to servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">No Accounts Required</h2>
            <p>
              Taliya does not require you to create an account, sign in, or provide any personal information
              to use the app. You can start using all features immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Notifications (iOS App)</h2>
            <p>
              The iOS app may request permission to send local notifications for daily prayer reminders and
              habit check-ins. These notifications are generated entirely on your device. No notification
              data is sent to any server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Third-Party Services</h2>
            <p>
              Taliya does not integrate with any third-party analytics, advertising, or tracking services.
              The app is hosted on Vercel, which may log standard web server access logs (IP address,
              user agent, timestamps) as part of normal web hosting. We do not access or use these logs
              for any purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Data Export & Deletion</h2>
            <p>
              You can export all your data from the Settings page in the Tracker. To delete all data,
              clear your browser&apos;s localStorage for taliya.vercel.app, or uninstall the app. Since
              we store nothing on our servers, deletion is instant and complete.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Children&apos;s Privacy</h2>
            <p>
              Taliya is suitable for users of all ages. We do not knowingly collect any data from anyone,
              including children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Changes to This Policy</h2>
            <p>
              If we ever change this privacy policy, we will update this page with the new date. Since
              we collect no data, meaningful changes are unlikely.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">Contact</h2>
            <p>
              If you have questions about this privacy policy, contact us at{" "}
              <a href="mailto:agentabudi@zohomail.com" className="text-emerald-600 underline hover:text-emerald-800">
                agentabudi@zohomail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
