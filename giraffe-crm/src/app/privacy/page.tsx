import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Holy Giraffe',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 font-mono text-foreground">
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 24, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Who We Are</h2>
          <p>
            Holy Giraffe (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates a professional window cleaning
            service in the Newport Beach, California area. This privacy policy explains how we collect, use, and
            protect your information when you interact with our services and our application at app.holygiraffe.com
            (&quot;the App&quot;).
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <p className="mt-2">
            <strong>Contact information:</strong> Your name, phone number, email address, and service address.
            This is collected when we provide you with a quote or schedule a service.
          </p>
          <p className="mt-2">
            <strong>Service information:</strong> Details about the services quoted or performed at your property,
            including window count, service type, pricing, appointment dates, and job completion records.
          </p>
          <p className="mt-2">
            <strong>Payment information:</strong> Invoice amounts and payment status. We do not store credit card
            numbers or bank account details.
          </p>
          <p className="mt-2">
            <strong>Google account data:</strong> If our team connects a Google account to the App, we access
            Google Calendar to create and manage service appointments. We only access calendar data necessary
            for scheduling. We do not access your Google account — only our own team accounts are connected.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">How We Use Your Information</h2>
          <p>We use your information to:</p>
          <p className="mt-2">
            Provide window cleaning quotes and services. Send appointment confirmations and reminders via SMS.
            Send invoices for completed services. Follow up on quotes you have requested. Improve our service
            quality and scheduling efficiency.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">SMS Communications</h2>
          <p>
            We send automated text messages to the phone number you provide for appointment confirmations,
            service reminders, and invoice delivery. These messages are sent from an automated system and are
            for informational purposes only. You may opt out of SMS communications at any time by contacting
            us at (949) 315-7142.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Data Storage and Security</h2>
          <p>
            Your data is stored securely using Supabase, a cloud database platform with enterprise-grade
            security including encryption at rest and in transit. Access to customer data is restricted to
            authorized Holy Giraffe team members only.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Third-Party Services</h2>
          <p>We use the following third-party services to operate the App:</p>
          <p className="mt-2">
            <strong>Supabase:</strong> Database and authentication.{' '}
            <strong>Mapbox:</strong> Mapping and address lookup.{' '}
            <strong>Google Calendar API:</strong> Appointment scheduling (team accounts only).{' '}
            <strong>Twilio:</strong> SMS message delivery.{' '}
            <strong>Cloudflare:</strong> Website hosting and security.
          </p>
          <p className="mt-2">
            We do not sell, trade, or rent your personal information to third parties. We only share data
            with the service providers listed above as necessary to operate our business.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Google API Disclosure</h2>
          <p>
            The App&apos;s use and transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We only use Google Calendar access to create and manage
            service appointments for our team. We do not use Google data for advertising or any unrelated purpose.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Your Rights</h2>
          <p>
            You may request to view, update, or delete your personal information at any time by contacting us.
            California residents have additional rights under the California Consumer Privacy Act (CCPA),
            including the right to know what personal information we collect and the right to request deletion.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Data Retention</h2>
          <p>
            We retain your information for as long as necessary to provide our services and fulfill the purposes
            described in this policy. If you request deletion of your data, we will remove it within 30 days,
            except where we are required by law to retain it.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page with
            an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or your data, contact us at:
          </p>
          <p className="mt-2">
            Holy Giraffe Window Cleaning<br />
            Phone: (949) 315-7142<br />
            Email: khanjani1997@gmail.com
          </p>
        </section>
      </div>
    </main>
  )
}
