'use client';

import { API_BASE_URL } from '@/lib/environment';

import { useState, useEffect } from 'react';
import { usePlaygroundApiKey } from '@/lib/usePlaygroundApiKey';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function PlaygroundPage() {
  const [adminKey, setAdminKey] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'user', content: '' }]);
  const [model, setModel] = useState('qwen3.7-plus');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [stream, setStream] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { keys, selectedId, selectedKey, secret, loadingKeys, loadingSecret, error: keyError, selectKey } = usePlaygroundApiKey(adminKey);
  const router = useRouter();

  useEffect(() => {
    const savedKey = sessionStorage.getItem('adminKey');
    if (!savedKey) {
      router.push('/');
      return;
    }
    setAdminKey(savedKey);
  }, [router]);

  const apiUrl = API_BASE_URL;

  const models = [
    { id: 'qwen3.7-plus', name: 'Qwen 3.7 Plus' },
    { id: 'qwen3.8-max', name: 'Qwen 3.8 Max' },
    { id: 'qwen3.7-max', name: 'Qwen 3.7 Max' },
    { id: 'qwen3.6-plus', name: 'Qwen 3.6 Plus' },
    { id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus' },
    { id: 'qwen3.5-omni-plus', name: 'Qwen 3.5 Omni Plus' },
  ];

  const addMessage = (role: 'user' | 'assistant') => {
    setMessages([...messages, { role, content: '' }]);
  };

  const updateMessage = (index: number, content: string) => {
    const newMessages = [...messages];
    newMessages[index].content = content;
    setMessages(newMessages);
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      if (!secret || !selectedKey) throw new Error('Select an active API key before sending a request.');
      const filteredMessages = messages.filter(m => m.content.trim());

      if (filteredMessages.length === 0) {
        throw new Error('Please add at least one message');
      }

      const requestBody = {
        model,
        messages: filteredMessages,
        temperature,
        max_tokens: maxTokens,
        stream,
      };

      const res = await fetch(`${apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Request failed');
      }

      if (stream) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response body');

        let accumulatedResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                accumulatedResponse += content;
                setResponse(accumulatedResponse);
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setResponse(data.choices[0]?.message?.content || 'No response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'user', content: '' }]);
    setResponse('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">API Playground</h1>
              <p className="text-gray-400 text-sm mt-1">Test the Qwen API interactively</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-[#263449] text-gray-300 rounded text-sm font-medium hover:bg-[#152033] transition-colors duration-150"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Request Builder */}
          <div className="space-y-6">
            {/* Model & Parameters */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="playground-page-api-key" className="block text-sm font-medium text-gray-300 mb-2">API key</label>
                  <select id="playground-page-api-key" value={selectedId} onChange={event => selectKey(event.target.value)} disabled={loadingKeys || loadingSecret} className="input-field w-full px-3 py-2">
                    <option value="">{loadingKeys ? 'Loading active keys…' : 'Choose an active API key'}</option>
                    {keys.map(key => <option key={key.id} value={key.id}>{key.name} · {key.tier} · {key.usage_count.toLocaleString()} requests</option>)}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Only the selected key is revealed to this view in memory. Playground calls consume that key’s quota and usage.</p>
                  {keyError && <p className="mt-2 text-sm text-red-300">{keyError}</p>}
                  {!loadingKeys && keys.length === 0 && !keyError && <p className="mt-2 text-sm text-amber-300">No active API keys are available.</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1523] border border-[#263449] text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="8000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="stream"
                    checked={stream}
                    onChange={(e) => setStream(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-[#0d1523] border-[#263449] rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="stream" className="ml-2 text-sm text-gray-300">
                    Stream response
                  </label>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-100">Messages</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => addMessage('user')}
                    className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-400 transition-colors duration-150"
                  >
                    + User
                  </button>
                  <button
                    onClick={() => addMessage('assistant')}
                    className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-500 transition-colors duration-150"
                  >
                    + Assistant
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className="bg-[#070b13] p-3 rounded-xl border border-[#263449]">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        message.role === 'user'
                          ? 'bg-indigo-900/30 text-indigo-400'
                          : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {message.role}
                      </span>
                      <button
                        onClick={() => removeMessage(index)}
                        className="text-gray-500 hover:text-red-400 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      value={message.content}
                      onChange={(e) => updateMessage(index, e.target.value)}
                      placeholder={`Enter ${message.role} message...`}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#0d1523] border border-[#263449] text-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSend}
                disabled={loading || loadingSecret || !secret}
                className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 disabled:opacity-50 transition-colors duration-150"
              >
                {loading ? 'Sending…' : 'Send request'}
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="px-4 py-3 border border-[#263449] text-gray-300 rounded-xl font-medium hover:bg-[#152033] disabled:opacity-50 transition-colors duration-150"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right: Response */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Response</h3>

              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {loading && !stream && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                  <div className="text-gray-400 text-sm">Waiting for response...</div>
                </div>
              )}

              {(response || (loading && stream)) && (
                <div className="bg-[#0a1220] p-5 rounded-xl border border-[#263449] min-h-[400px]">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                    {response || 'Streaming...'}
                  </pre>
                </div>
              )}

              {!response && !loading && !error && (
                <div className="bg-[#070b13] p-12 rounded-xl border border-[#263449] text-center">
                  <div className="text-gray-500">Response will appear here</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
