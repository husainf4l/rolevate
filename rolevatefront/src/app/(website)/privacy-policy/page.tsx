"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Rolevate</title>
        <meta name="description" content="Rolevate's Privacy Policy" />
      </Head>

      <Navbar/>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: June 14, 2025</p>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            Rolevate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services, including our interview platform and related features (collectively, the "Service").
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy and our Terms of Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-2">2.1 Personal Information</h3>
          <p>We may collect personal information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name, email address, phone number, and other contact information</li>
            <li>Account credentials (username, password)</li>
            <li>Professional information (resume/CV, work history, education, skills)</li>
            <li>Profile information and preferences</li>
            <li>Payment information (processed through secure third-party payment processors)</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">2.2 Interview Recordings and Data</h3>
          <p>When you participate in interviews through our Service:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Audio and video recordings of interview sessions</li>
            <li>Chat messages exchanged during interviews</li>
            <li>Interview transcriptions</li>
            <li>Assessment data and feedback</li>
          </ul>
          <p>
            <strong>Important:</strong> Before each interview recording begins, we will notify you and request your consent. You have the right to withdraw consent for recording at any time, though this may affect your ability to participate in certain interview processes.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">2.3 WhatsApp Communication Data</h3>
          <p>If you opt to communicate with us via WhatsApp:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your WhatsApp phone number</li>
            <li>Message content and history</li>
            <li>Media shared via WhatsApp</li>
            <li>Time and date of communications</li>
          </ul>
          <p>
            Our use of WhatsApp Business API complies with WhatsApp's Business Policy and Terms of Service. By opting to communicate with us through WhatsApp, you acknowledge that your communications will be processed according to both this Privacy Policy and WhatsApp's Privacy Policy.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">2.4 Usage and Technical Information</h3>
          <p>We automatically collect certain information when you visit, use, or navigate our Service:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Device and connection information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, time spent, click patterns)</li>
            <li>Cookies and similar tracking technologies</li>
            <li>Performance and error data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing, maintaining, and improving our Service</li>
            <li>Processing and facilitating interview sessions</li>
            <li>Analyzing and sharing interview performance with authorized hiring organizations</li>
            <li>Communicating with you about your account or our Service</li>
            <li>Sending notifications, updates, and marketing communications</li>
            <li>Monitoring and analyzing usage patterns and trends</li>
            <li>Detecting, preventing, and addressing technical issues or fraudulent activities</li>
            <li>Complying with legal obligations and protecting our rights</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">3.1 Interview Recordings</h3>
          <p>
            Interview recordings are specifically used for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Assessment and evaluation by potential employers or their representatives</li>
            <li>Quality assurance and improvement of our interview processes</li>
            <li>Training and development of our AI systems (only with additional explicit consent)</li>
            <li>Addressing disputes or compliance concerns</li>
          </ul>
          <p>
            We retain interview recordings for a limited period based on the purpose of the interview and legal requirements. Candidates may request access to their recordings or request deletion (subject to certain limitations).
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">3.2 WhatsApp Communications</h3>
          <p>
            Data collected through WhatsApp communications is used for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Responding to your inquiries and providing customer support</li>
            <li>Sending you notifications about interview scheduling, changes, or results</li>
            <li>Providing updates about your application status</li>
            <li>Improving our messaging services</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing of Your Information</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Hiring Organizations:</strong> Companies or organizations that are considering your application may access your profile information and interview recordings.</li>
            <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, data analytics, payment processing, customer service).</li>
            <li><strong>Business Partners:</strong> Entities with whom we collaborate to offer certain services or promotions.</li>
            <li><strong>Legal Requirements:</strong> When required by law, subpoena, or legal process.</li>
            <li><strong>Protection of Rights:</strong> When necessary to protect our rights, privacy, safety, or property.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The specific retention periods are:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information: For the duration of your account plus 2 years after account closure</li>
            <li>Interview recordings: Up to 1 year following the interview, unless otherwise requested</li>
            <li>WhatsApp communications: Up to 2 years from the last interaction</li>
            <li>Usage data: Up to 3 years in aggregated form</li>
          </ul>
          <p>
            You can request deletion of your data at any time, subject to our legal obligations and legitimate business interests.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Access and Portability:</strong> Request a copy of your personal information.</li>
            <li><strong>Correction:</strong> Request that we correct inaccurate information.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information.</li>
            <li><strong>Restriction:</strong> Request restriction of processing of your personal information.</li>
            <li><strong>Objection:</strong> Object to our processing of your personal information.</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time for activities based on consent.</li>
          </ul>
          <p>
            To exercise these rights, please contact us at privacy@rolevate.com.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">6.1 Interview Recording Consent</h3>
          <p>
            For interview recordings, we implement a specific consent process:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>You will be notified before recording begins</li>
            <li>Clear on-screen indicators will show when recording is active</li>
            <li>You can withdraw consent before or during an interview</li>
            <li>You may request access to your recordings</li>
            <li>You may request deletion of recordings (subject to legal limitations)</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">6.2 WhatsApp Communication Preferences</h3>
          <p>
            You can manage your WhatsApp communication preferences by:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Opting out of WhatsApp communications by replying "STOP" or "UNSUBSCRIBE"</li>
            <li>Adjusting notification settings in your account preferences</li>
            <li>Contacting our support team to change your communication channel preference</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Security of Your Information</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
          <p>
            For interview recordings and sensitive data, we implement additional safeguards:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Access controls and authentication requirements</li>
            <li>Regular security assessments and audits</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that differ from your country.
          </p>
          <p>
            When we transfer personal information outside of the EEA, UK, or Switzerland, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses, adequacy decisions, or other legally approved mechanisms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn we have collected personal information from a child without parental consent, we will delete that information as quickly as possible.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Third-Party Links and Services</h2>
          <p>
            Our Service may contain links to third-party websites or services that are not owned or controlled by Rolevate. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Updates to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. The updated version will be indicated by an updated "Last Updated" date. We encourage you to review this Privacy Policy regularly.
          </p>
          <p>
            If we make material changes, we will provide notice through our Service or by other means.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            Email: privacy@rolevate.com<br />
            Address: [Your Company Address]<br />
            Phone: [Your Company Phone Number]
          </p>
          <p>
            For data subjects in the European Union, you have the right to lodge a complaint with your local data protection authority.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
