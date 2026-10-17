'use client';

interface DocsModalProps {
  onClose: () => void;
}

export default function DocsModal({ onClose }: DocsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card max-w-4xl w-full my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-100">API Documentation</h2>
            <p className="text-gray-400 text-sm mt-1">OpenAI-compatible API for Qwen models</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Documentation Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Authentication */}
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Authentication</h3>
            <p className="text-gray-300 mb-3 text-sm">
              All API requests require authentication using an API key in the Authorization header:
            </p>
            <pre className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-sm text-gray-300 overflow-x-auto">
{`Authorization: Bearer sk-your-api-key-here`}
            </pre>
            <p className="text-gray-400 text-xs mt-2">
              API keys can be managed through the dashboard. Each key has a tier (free, premium, enterprise) with different rate limits and features.
            </p>
          </div>

          {/* Base URL */}
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Base URL</h3>
            <pre className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-sm text-gray-300">
{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
            </pre>
          </div>

          {/* Endpoints */}
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Endpoints</h3>

            {/* List Models */}
            <div className="mb-6 pb-6 border-b border-[#333]">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded">GET</span>
                <code className="text-indigo-400 text-sm">/v1/models</code>
              </div>
              <p className="text-gray-300 mb-3 text-sm">List available Qwen models.</p>
              <div className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                <p className="text-xs text-gray-500 mb-2">Example Response:</p>
                <pre className="text-xs text-gray-300 overflow-x-auto">
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
                <code className="text-indigo-400 text-sm">/v1/chat/completions</code>
              </div>
              <p className="text-gray-300 mb-3 text-sm">Create a chat completion using Qwen models.</p>

              <div className="space-y-4">
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Request Body:</p>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
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

                <div className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Example Response (Non-streaming):</p>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
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

                <div className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                  <p className="text-xs text-gray-500 mb-2">Streaming Response (stream: true):</p>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
{`data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":"!"}}]}
data: [DONE]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Request Parameters</h3>
            <div className="space-y-3 text-sm">
              <div>
                <code className="text-indigo-400">model</code>
                <span className="text-red-400 ml-2 text-xs">required</span>
                <p className="text-gray-400 text-xs mt-1">ID of the model to use (e.g., "qwen3.7-plus")</p>
              </div>
              <div>
                <code className="text-indigo-400">messages</code>
                <span className="text-red-400 ml-2 text-xs">required</span>
                <p className="text-gray-400 text-xs mt-1">Array of message objects with "role" and "content"</p>
              </div>
              <div>
                <code className="text-indigo-400">temperature</code>
                <span className="text-gray-500 ml-2 text-xs">optional (default: 0.7)</span>
                <p className="text-gray-400 text-xs mt-1">Sampling temperature between 0 and 2</p>
              </div>
              <div>
                <code className="text-indigo-400">max_tokens</code>
                <span className="text-gray-500 ml-2 text-xs">optional (default: 2000)</span>
                <p className="text-gray-400 text-xs mt-1">Maximum tokens to generate</p>
              </div>
              <div>
                <code className="text-indigo-400">stream</code>
                <span className="text-gray-500 ml-2 text-xs">optional (default: false)</span>
                <p className="text-gray-400 text-xs mt-1">Whether to stream responses via Server-Sent Events</p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Code Examples</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2 font-medium text-sm">cURL</p>
                <pre className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-xs text-gray-300 overflow-x-auto">
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
                <p className="text-gray-300 mb-2 font-medium text-sm">Python (OpenAI SDK)</p>
                <pre className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-xs text-gray-300 overflow-x-auto">
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
                <p className="text-gray-300 mb-2 font-medium text-sm">Node.js (OpenAI SDK)</p>
                <pre className="bg-[#1a1a1a] p-3 rounded border border-[#333] text-xs text-gray-300 overflow-x-auto">
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
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Error Codes</h3>
            <div className="space-y-2 text-sm">
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
          <div className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Rate Limits by Tier (per instance; configurable)</h3>
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
                    <td className="py-3 text-gray-400">20 (default)</td>
                    <td className="py-3 text-gray-400">Not enforced</td>
                    <td className="py-3 text-gray-400">All models</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">Premium</td>
                    <td className="py-3 text-gray-400">60 (default)</td>
                    <td className="py-3 text-gray-400">Not enforced</td>
                    <td className="py-3 text-gray-400">All models</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">Enterprise</td>
                    <td className="py-3 text-gray-400">120 (default)</td>
                    <td className="py-3 text-gray-400">Not enforced</td>
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
