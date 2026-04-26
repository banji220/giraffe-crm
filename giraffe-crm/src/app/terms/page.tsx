import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Holy Giraffe',
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 font-mono text-foreground">
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 24, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Agreement to Terms</h2>
          <p>
            By accessing or using the Holy Giraffe application at app.holygiraffe.com (&quot;the App&quot;) or
            by engaging our window cleaning services, you agree to be bound by these Terms of Service. If you
            do not agree to these terms, please do not use the App or our services.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Services</h2>
          <p>
            Holy Giraffe provides professional window cleaning services in the Newport Beach, California area.
            The App is used by our team to manage quotes, appointments, and customer communications. Quotes
            provided are estimates based on the information available at the time and may be adjusted upon
            inspection of the property.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Appointments and Cancellations</h2>
          <p>
            When you accept a quote and schedule an appointment, we commit time and resources to your service.
            We ask that you provide at least 24 hours notice if you need to cancel or reschedule. You can
            contact us at (949) 315-7142 to make changes to your appointment.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Pricing and Payment</h2>
          <p>
            Prices are quoted based on the number of windows, type of service (exterior only, interior and
            exterior, screens, tracks), and property conditions. Payment is due upon completion of service
            unless otherwise agreed. We will send an invoice via SMS or email after the job is completed.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">SMS Communications</h2>
          <p>
            By providing your phone number, you consent to receive automated SMS messages from Holy Giraffe
            for appointment confirmations, reminders, and invoices. These messages are transactional and
            not marketing communications. Message and data rates may apply. You can opt out at any time
            by contacting us at (949) 315-7142.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Liability</h2>
          <p>
            Holy Giraffe carries appropriate insurance for our window cleaning operations. We take care to
            protect your property during service. If any damage occurs as a direct result of our work,
            please notify us within 48 hours so we can assess and address the situation. Our liability
            is limited to the cost of the service provided.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Access to Property</h2>
          <p>
            By scheduling a service, you grant Holy Giraffe permission to access your property for the
            purpose of performing the agreed-upon window cleaning services. Please ensure that any gates
            are accessible and pets are secured during the service appointment.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Use of the App</h2>
          <p>
            The App is intended for use by Holy Giraffe team members to manage operations. Customer-facing
            features such as invoice viewing are provided for your convenience. You agree not to misuse
            the App or attempt to access areas or data not intended for you.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted on this page with an
            updated revision date. Continued use of our services after changes constitutes acceptance
            of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of California. Any disputes arising from
            these terms or our services shall be resolved in the courts of Orange County, California.
          </p>
        </section>

        <section>
          <h2 className="font-bold uppercase tracking-wider mb-2">Contact Us</h2>
          <p>
            If you have any questions about these terms, contact us at:
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
