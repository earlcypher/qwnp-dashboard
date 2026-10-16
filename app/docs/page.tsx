'use client';

import { useRouter } from 'next/navigation';

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">API Documentation</h1>
              <p className="text-gray-400 text-sm mt-1">OpenAI-compatible API for Qwen models</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-[#333] text-gray-300 rounded text-sm font-medium hover:bg-[#252525] transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Documentation Content */}
        <div className="space-y-6">
          {/* Authentication */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Authentication</h2>
            <p className="text-gray-300 mb-4">
              All API requests require authentication using an API key in the Authorization header:
            </p>
            <pre className="bg-[#0a0a0a] p-4 rounded border border-[#333] text-sm text-gray-300 overflow-x-auto">
{`Authorization: Bearer sk-your-api-key-here`}
            </pre>
            <p className="text-gray-400 text-sm mt-3">
              API keys can be managed through the dashboard. Each key has a tier (free, premium, enterprise) with different rate limits and features.
            </p>
          </div>

          {/* Base URL */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Base URL</h2>
            <pre className="bg-[#0a0a0a] p-4 rounded border border-[#333] text-sm text-gray-300">
{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
            </pre>
          </div>

          {/* Endpoints */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Endpoints</h2>

            {/* List Models */}
            <div className="mb-6 pb-6 border-b border-[#333]">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded">GET</span>
                <code className="text-indigo-400">/v1/models</code>
              </div>
              <p className="text-gray-300 mb-3">List available Qwen models.</p>
              <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
                <p className="text-xs text-gray-500 mb-2">Example Response:</p>
                <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "object": "list",
  "data": [
    { "id": "qwen3.7-plus", "object": "model" },
    { "id": "qwen-max", "object": "model" },
    { "id": "qwen-turbo", "object": "model" },
    { "id": "qwen-plus", "object": "model" }
  ]
}`}
                </pre>
              </div>
            </div>

            {/* Chat Completions */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs font-medium rounded">POST</span>
                <code className="text-indigo-400">/v1/chat/completions</code>
              </div>
              <p className="text-gray-300 mb-3">Create a chat completion using Qwen models.</p>

              <div className="space-y-4">
                <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Request Body:</p>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "model": "qwen3.7-plus",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": false
}`}
                  </pre>
                </div>

                <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Example Response (Non-streaming):</p>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "qwen3.7-plus",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}`}
                  </pre>
                </div>

                <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Streaming Response (stream: true):</p>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":"!"}}]}
data: [DONE]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Request Parameters</h2>
            <div className="space-y-4 text-sm">
              <div>
                <code className="text-indigo-400">model</code>
                <span className="text-red-400 ml-2">required</span>
                <p className="text-gray-400 mt-1">ID of the model to use (e.g., "qwen3.7-plus")</p>
              </div>
              <div>
                <code className="text-indigo-400">messages</code>
                <span className="text-red-400 ml-2">required</span>
                <p className="text-gray-400 mt-1">Array of message objects with "role" and "content"</p>
              </div>
              <div>
                <code className="text-indigo-400">temperature</code>
                <span className="text-gray-500 ml-2">optional (default: 0.7)</span>
                <p className="text-gray-400 mt-1">Sampling temperature between 0 and 2</p>
              </div>
              <div>
                <code className="text-indigo-400">max_tokens</code>
                <span className="text-gray-500 ml-2">optional (default: 2000)</span>
                <p className="text-gray-400 mt-1">Maximum tokens to generate</p>
              </div>
              <div>
                <code className="text-indigo-400">stream</code>
                <span className="text-gray-500 ml-2">optional (default: false)</span>
                <p className="text-gray-400 mt-1">Whether to stream responses via Server-Sent Events</p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Code Examples</h2>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2 font-medium">cURL</p>
                <pre className="bg-[#0a0a0a] p-4 rounded border border-[#333] text-sm text-gray-300 overflow-x-auto">
{`curl ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen3.7-plus",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
                </pre>
              </div>

              <div>
                <p className="text-gray-300 mb-2 font-medium">Python (OpenAI SDK)</p>
                <pre className="bg-[#0a0a0a] p-4 rounded border border-[#333] text-sm text-gray-300 overflow-x-auto">
{`from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1"
)

response = client.chat.completions.create(
    model="qwen3.7-plus",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}
                </pre>
              </div>

              <div>
                <p className="text-gray-300 mb-2 font-medium">Node.js (OpenAI SDK)</p>
                <pre className="bg-[#0a0a0a] p-4 rounded border border-[#333] text-sm text-gray-300 overflow-x-auto">
{`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1'
});

const response = await client.chat.completions.create({
  model: 'qwen3.7-plus',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);`}
                </pre>
              </div>
            </div>
          </div>

          {/* Error Codes */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Error Codes</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <code className="text-yellow-400">400</code>
                <span className="text-gray-300">Bad Request - Invalid parameters</span>
              </div>
              <div className="flex gap-3">
                <code className="text-yellow-400">401</code>
                <span className="text-gray-300">Unauthorized - Invalid or missing API key</span>
              </div>
              <div className="flex gap-3">
                <code className="text-yellow-400">403</code>
                <span className="text-gray-300">Forbidden - API key is inactive</span>
              </div>
              <div className="flex gap-3">
                <code className="text-yellow-400">429</code>
                <span className="text-gray-300">Too Many Requests - Rate limit exceeded</span>
              </div>
              <div className="flex gap-3">
                <code className="text-red-400">500</code>
                <span className="text-gray-300">Internal Server Error</span>
              </div>
              <div className="flex gap-3">
                <code className="text-red-400">503</code>
                <span className="text-gray-300">Service Unavailable - Qwen API unreachable</span>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Rate Limits by Tier</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#333]">
                  <tr className="text-left">
                    <th className="pb-3 text-gray-400 font-medium">Tier</th>
                    <th className="pb-3 text-gray-400 font-medium">Requests/min</th>
                    <th className="pb-3 text-gray-400 font-medium">Requests/day</th>
                    <th className="pb-3 text-gray-400 font-medium">Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  <tr>
                    <td className="py-3 text-gray-300">Free</td>
                    <td className="py-3 text-gray-400">10</td>
                    <td className="py-3 text-gray-400">1,000</td>
                    <td className="py-3 text-gray-400">Basic models</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">Premium</td>
                    <td className="py-3 text-gray-400">60</td>
                    <td className="py-3 text-gray-400">10,000</td>
                    <td className="py-3 text-gray-400">All models, priority support</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">Enterprise</td>
                    <td className="py-3 text-gray-400">Unlimited</td>
                    <td className="py-3 text-gray-400">Unlimited</td>
                    <td className="py-3 text-gray-400">All features, admin access</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
