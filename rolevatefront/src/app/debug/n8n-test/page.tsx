"use client";

import React, { useState } from "react";
import { n8nService } from "../../../services/n8n.service";

export default function N8NTestPage() {
  const [testMessage, setTestMessage] = useState("Senior Software Engineer");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testN8NWebhook = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const testRequest = {
        userMessage: testMessage,
        currentStep: "greeting",
        conversationHistory: [],
        extractedData: {
          requirements: [],
          benefits: [],
        },
      };

      console.log("Testing n8n webhook with:", testRequest);
      const result = await n8nService.processJobMessage(testRequest);
      setResponse(result);
      console.log("n8n test result:", result);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      console.error("n8n test error:", err);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const webhookUrl =
        "https://n8n.widd.ai/webhook/5b51e858-a304-4e94-bd6d-f2157345f2b2/chat";

      const testPayload = {
        userMessage: testMessage,
        currentStep: "greeting",
        conversationHistory: [],
        extractedData: {
          requirements: [],
          benefits: [],
        },
      };

      console.log("Testing direct fetch to:", webhookUrl);
      console.log("Payload:", testPayload);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      console.log("Direct fetch response status:", response.status);
      console.log(
        "Direct fetch response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setResponse(data);
      console.log("Direct fetch result:", data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      console.error("Direct fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#00C6AD]">
          N8N Webhook Test
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Parameters</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Message:
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD] text-white"
              placeholder="Enter test message..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={testN8NWebhook}
              disabled={loading}
              className="px-6 py-2 bg-[#00C6AD] hover:bg-[#14B8A6] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Testing..." : "Test via N8N Service"}
            </button>

            <button
              onClick={testDirectFetch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Testing..." : "Test Direct Fetch"}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Webhook URL</h2>
          <code className="text-[#00C6AD] text-sm break-all">
            https://n8n.widd.ai/webhook/5b51e858-a304-4e94-bd6d-f2157345f2b2/chat
          </code>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-400 mb-2">Error:</h3>
            <pre className="text-red-300 text-sm whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        {response && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-green-400 mb-4">Response:</h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-auto max-h-96 bg-gray-900 p-4 rounded">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Make sure your n8n workflow is active and accessible</li>
            <li>Check the browser console for detailed logs</li>
            <li>Use "Test via N8N Service" to test the full integration</li>
            <li>Use "Test Direct Fetch" to test the webhook directly</li>
            <li>
              Verify the response format matches the expected N8NResponse
              interface
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
