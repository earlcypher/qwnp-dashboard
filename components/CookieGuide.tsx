'use client';

interface CookieGuideProps {
  onClose: () => void;
}

export default function CookieGuide({ onClose }: CookieGuideProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="card max-w-4xl w-full my-8 animate-slide-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0d1523] px-6 py-4 border-b border-[#263449] flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-100">Cookie Capture Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">What You Need</h3>
            <p className="text-sm text-gray-300 mb-3">
              To use the Qwen Proxy, you need to capture authentication credentials from your active Qwen web session:
            </p>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li><strong>Token (JWT)</strong> - Session authentication cookie (required)</li>
              <li><strong>bx-ua</strong> - Anti-bot protection header (required)</li>
              <li><strong>bx-umidtoken</strong> - Machine identifier (optional)</li>
            </ul>
          </div>

          {/* Method 1: Browser DevTools */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Method 1: Browser DevTools (Recommended)</h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-2">Log into Qwen Chat</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Visit <a href="https://chat.qwen.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://chat.qwen.ai</a> and sign in with your account.
                    </p>
                    <div className="bg-[#0d1523] border border-[#354660] rounded p-2 text-xs text-gray-500">
                      Make sure you're fully logged in and can send messages
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-2">Open Developer Tools</h4>
                    <p className="text-sm text-gray-400 mb-2">Press:</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <kbd className="px-2 py-1 bg-[#0d1523] border border-[#354660] rounded text-xs">F12</kbd> (Windows/Linux)</li>
                      <li>• <kbd className="px-2 py-1 bg-[#0d1523] border border-[#354660] rounded text-xs">Cmd+Opt+I</kbd> (Mac)</li>
                      <li>• Or right-click to "Inspect"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-2">Capture the Token Cookie</h4>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                      <li>Go to the <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)</li>
                      <li>Expand <strong>Cookies</strong> in the left sidebar</li>
                      <li>Click on <code className="text-indigo-400 text-xs bg-[#0d1523] px-1">https://chat.qwen.ai</code></li>
                      <li>Find the cookie named <code className="text-indigo-400 text-xs bg-[#0d1523] px-1">token</code></li>
                      <li>Copy the <strong>Value</strong> (should start with "eyJ...")</li>
                    </ol>
                    <div className="bg-[#0d1523] border border-[#354660] rounded p-2 text-xs text-gray-500 mt-2">
                      Note: The token is a JWT (JSON Web Token) and is typically 200-500 characters long
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-2">Capture the bx-ua Header</h4>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                      <li>Go to the <strong>Network</strong> tab</li>
                      <li>Type a test message in Qwen chat</li>
                      <li>Find a request to <code className="text-indigo-400 text-xs bg-[#0d1523] px-1">qwen.ai</code> in the list</li>
                      <li>Click on it and go to <strong>Headers</strong> section</li>
                      <li>Scroll to <strong>Request Headers</strong></li>
                      <li>Find <code className="text-indigo-400 text-xs bg-[#0d1523] px-1">bx-ua</code> and copy its value</li>
                    </ol>
                    <div className="bg-[#0d1523] border border-[#354660] rounded p-2 text-xs text-gray-500 mt-2">
                      Note: This header is ~2000 characters and contains anti-bot fingerprinting data
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">5</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-2">Capture bx-umidtoken (Optional)</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      In the same cookie list from Step 3, find:
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Cookie name: <code className="text-indigo-400 text-xs bg-[#0d1523] px-1">bx-umidtoken</code></li>
                      <li>Copy its value (if present)</li>
                    </ul>
                    <div className="bg-yellow-900/20 border border-yellow-800 rounded p-2 text-xs text-yellow-300 mt-2">
                      Note: This is optional but may improve reliability
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-[#070b13] border border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-2">Paste into Dashboard</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Return to the dashboard and paste your credentials into the Manual Input form.
                    </p>
                    <div className="bg-green-900/20 border border-green-800 rounded p-2 text-xs text-green-300 mt-2">
                      Click "Save Credentials" and test the connection!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Browser Extension */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Method 2: Export cookies.txt (Alternative)</h3>

            <div className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-3">
                If you prefer, you can use a browser extension to export cookies in Netscape format:
              </p>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Install a cookie export extension (e.g., "Get cookies.txt LOCALLY" for Chrome)</li>
                <li>Visit <a href="https://chat.qwen.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://chat.qwen.ai</a></li>
                <li>Use the extension to export cookies</li>
                <li>Upload the cookies.txt file using the "Upload cookies.txt" button</li>
              </ol>
              <div className="bg-yellow-900/20 border border-yellow-800 rounded p-2 text-xs text-yellow-300 mt-3">
                Note: You'll still need to manually capture the bx-ua header from DevTools
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Important Security Notes</h3>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li><strong>Never share your cookies</strong> - They grant full access to your Qwen account</li>
              <li><strong>Cookies expire</strong> - Token typically expires after 7-30 days</li>
              <li><strong>Regenerate if compromised</strong> - Log out and log back in to get fresh credentials</li>
              <li><strong>Use on trusted servers only</strong> - Only upload to your own proxy instance</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Troubleshooting</h3>

            <div className="space-y-3">
              <details className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <summary className="font-semibold text-gray-100 cursor-pointer">Token not found in cookies</summary>
                <p className="text-sm text-gray-400 mt-2">
                  Make sure you're logged in to chat.qwen.ai. Try logging out and logging back in, then check again.
                </p>
              </details>

              <details className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <summary className="font-semibold text-gray-100 cursor-pointer">bx-ua header not visible</summary>
                <p className="text-sm text-gray-400 mt-2">
                  Send a message in Qwen chat first to trigger API requests. The header only appears in actual chat API calls.
                </p>
              </details>

              <details className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <summary className="font-semibold text-gray-100 cursor-pointer">Connection test fails after upload</summary>
                <p className="text-sm text-gray-400 mt-2">
                  Verify that: (1) Your token hasn't expired, (2) You copied the complete bx-ua value, (3) Your Qwen account is still active.
                </p>
              </details>

              <details className="bg-[#070b13] border border-[#263449] rounded-lg p-4">
                <summary className="font-semibold text-gray-100 cursor-pointer">Token expires quickly</summary>
                <p className="text-sm text-gray-400 mt-2">
                  Token expiration is controlled by Qwen. Typical lifetime is 7-30 days. Set up monitoring to get alerted before expiration.
                </p>
              </details>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-indigo-300 mb-2">Quick Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-gray-100">Token Cookie:</strong>
                <p className="text-gray-400">Application to Cookies to token</p>
              </div>
              <div>
                <strong className="text-gray-100">bx-ua Header:</strong>
                <p className="text-gray-400">Network to Request Headers to bx-ua</p>
              </div>
              <div>
                <strong className="text-gray-100">Token Format:</strong>
                <p className="text-gray-400">JWT starting with "eyJ..."</p>
              </div>
              <div>
                <strong className="text-gray-100">bx-ua Length:</strong>
                <p className="text-gray-400">~2000 characters</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0d1523] px-6 py-4 border-t border-[#263449] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-500 text-white rounded text-sm font-medium hover:bg-indigo-400 transition-colors duration-150"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
