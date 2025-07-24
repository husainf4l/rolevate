import React from "react";

export default function DataDeletionPage() {
  return (
    <section className="w-full min-h-[70vh] bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/5 flex items-center justify-center py-12">
      <div className="backdrop-blur-xl bg-white/80 border border-gray-200/40 shadow-2xl rounded-3xl max-w-2xl w-full mx-4 px-8 py-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent tracking-tight">
          Data Deletion Request
        </h1>
        <div className="font-text text-gray-600 mb-6 text-lg">
          Request the deletion of your personal data from our platform in
          compliance with privacy regulations
        </div>
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">
            How to Request Data Deletion
          </h2>
          <p className="mb-2">
            To delete your data from our platform, please send an email to our
            data protection team:
          </p>
          <a
            href="mailto:info@roxate.com?subject=Data%20Deletion%20Request&body=Full%20Name:%20%5BYour%20Name%5D%0AEmail%20Address:%20%5BYour%20Email%5D%0AAccount%20Username:%20%5BYour%20Username%5D%0A"
            className="text-[#0891b2] font-semibold underline hover:text-[#13ead9] transition"
          >
            info@roxate.com
          </a>
          <div className="text-xs text-gray-500 mt-1">
            Click to open email with pre-filled template
          </div>
          <div className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">Note:</span> Please use the email
            address associated with your Rolevate account to ensure proper
            verification.
          </div>
        </section>
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Information to Include</h2>
          <ul className="list-disc ml-6">
            <li>
              <span className="font-semibold">Subject Line:</span> &quot;Data
              Deletion Request&quot;
            </li>
            <li>
              <span className="font-semibold">Full Name:</span> As registered on
              your account
            </li>
            <li>
              <span className="font-semibold">Email Address:</span> Associated
              with your account
            </li>
            <li>
              <span className="font-semibold">Account Username:</span> If
              applicable
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">
            What Data Will Be Deleted
          </h2>
          <ul className="list-disc ml-6 mb-2">
            <li>
              Personal Information
              <ul className="list-disc ml-6">
                <li>Profile information and contact details</li>
                <li>Account credentials and preferences</li>
                <li>Professional information and CV data</li>
                <li>Payment information</li>
              </ul>
            </li>
            <li>
              Interview Data
              <ul className="list-disc ml-6">
                <li>Audio and video recordings</li>
                <li>Interview transcriptions</li>
                <li>Assessment data and feedback</li>
                <li>Application history</li>
              </ul>
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">
            Deletion Process & Timeline
          </h2>
          <ol className="list-decimal ml-6 mb-2">
            <li>
              <span className="font-semibold">Email Verification</span>
              <div className="text-sm text-gray-600">
                We will verify your identity and account ownership within 2
                business days.
              </div>
            </li>
            <li>
              <span className="font-semibold">Data Processing</span>
              <div className="text-sm text-gray-600">
                Your data will be permanently deleted from our systems within 30
                days of verification.
              </div>
            </li>
            <li>
              <span className="font-semibold">Confirmation</span>
              <div className="text-sm text-gray-600">
                You will receive a confirmation email once the deletion process
                is complete.
              </div>
            </li>
          </ol>
        </section>
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Important Notes</h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            <li>Data deletion is permanent and cannot be undone</li>
            <li>
              You will lose access to your account and all associated data
            </li>
            <li>
              Some data may be retained for legal compliance purposes as
              outlined in our Privacy Policy
            </li>
            <li>
              Backups may take up to 90 days to be completely purged from our
              systems
            </li>
          </ul>
        </section>
        <p>Please type &quot;DELETE&quot; to confirm data deletion.</p>
        <p>Enter &quot;CONFIRM&quot; to proceed.</p>
        <div className="mt-8">
          <div className="mb-2 font-text text-gray-700">
            Have questions about data deletion? Need help with your request?
          </div>
          <a
            href="mailto:info@roxate.com"
            className="inline-block bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white px-6 py-2 rounded-lg shadow-md font-semibold text-base hover:from-[#0891b2] hover:to-[#13ead9] transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
