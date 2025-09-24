'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/common';
import Footer from '@/components/Footer';
import { Button } from '@/components/common';

interface CallParams {
  phone_number: string;
  subject: string;
  caller_name: string;
  agent_name: string;
  company_name: string;
  main_prompt: string;
  caller_id: string;
}

export default function TestCallPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const [callParams, setCallParams] = useState<CallParams>({
    phone_number: '0796026659',
    subject: 'Meeting confirmation',
    caller_name: 'Husain',
    agent_name: 'Sarah',
    company_name: 'TechCorp Solutions',
    main_prompt: 'I am calling to confirm our meeting tomorrow at 2 PM at your office. I need to discuss the project timeline, budget requirements of $50,000, and the deliverables we agreed upon. Please confirm if this time still works for you and if you have any questions about the project scope. Also ask about their team availability and if they need any additional resources.',
    caller_id: 'TechCorp Solutions'
  });

  const router = useRouter();

  React.useEffect(() => {
    const initializePage = async () => {
      const { locale: loc } = await params;
      setLocale(loc);
    };
    initializePage();
  }, [params]);

  const handleInputChange = (field: keyof CallParams, value: string) => {
    setCallParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const makeCall = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const response = await fetch('http://localhost:8000/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callParams)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="text-3xl font-medium text-foreground mb-4">
              Test Call API
            </h1>
            <p className="text-muted-foreground">
              Test the make-call API endpoint with customizable parameters
            </p>
          </div>

          <div className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={callParams.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter phone number"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                value={callParams.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Call subject"
              />
            </div>

            {/* Caller Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Caller Name
              </label>
              <input
                type="text"
                value={callParams.caller_name}
                onChange={(e) => handleInputChange('caller_name', e.target.value)}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>

            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={callParams.agent_name}
                onChange={(e) => handleInputChange('agent_name', e.target.value)}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Agent name"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={callParams.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Company name"
              />
            </div>

            {/* Caller ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Caller ID
              </label>
              <input
                type="text"
                value={callParams.caller_id}
                onChange={(e) => handleInputChange('caller_id', e.target.value)}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Caller ID"
              />
            </div>

            {/* Main Prompt */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Main Prompt
              </label>
              <textarea
                value={callParams.main_prompt}
                onChange={(e) => handleInputChange('main_prompt', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
                placeholder="Detailed prompt for the call"
              />
            </div>

            {/* Make Call Button */}
            <div className="flex gap-4">
              <Button
                onClick={makeCall}
                disabled={isLoading}
                className="px-8 py-3"
              >
                {isLoading ? 'Making Call...' : 'Make Call'}
              </Button>
              
              <Button
                onClick={() => router.back()}
                variant="secondary"
                className="px-8 py-3"
              >
                Go Back
              </Button>
            </div>

            {/* Response Section */}
            {(response || error) && (
              <div className="mt-8">
                <h2 className="text-xl font-medium text-foreground mb-4">
                  Response
                </h2>
                
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h3 className="font-medium text-destructive mb-2">Error:</h3>
                    <p className="text-destructive">{error}</p>
                  </div>
                )}

                {response && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h3 className="font-medium text-success mb-2">Success:</h3>
                    <pre className="text-foreground whitespace-pre-wrap text-sm">
                      {response}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* cURL Preview */}
            <div className="mt-8">
              <h2 className="text-xl font-medium text-foreground mb-4">
                cURL Command Preview
              </h2>
              <div className="p-4 bg-secondary rounded-lg">
                <pre className="text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
{`curl -X POST "http://localhost:8000/make-call" \\
     -H "Content-Type: application/json" \\
     -d '{
       "phone_number": "${callParams.phone_number}",
       "subject": "${callParams.subject}",
       "caller_name": "${callParams.caller_name}",
       "agent_name": "${callParams.agent_name}",
       "company_name": "${callParams.company_name}",
       "main_prompt": "${callParams.main_prompt.replace(/"/g, '\\"')}",
       "caller_id": "${callParams.caller_id}"
     }'`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}