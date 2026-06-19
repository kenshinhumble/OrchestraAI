'use client';

import { useEffect, useRef } from 'react';
import { GeneratedCode } from '@/lib/types';

interface LivePreviewProps {
  code: GeneratedCode | null;
}

export default function LivePreview({ code }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code?.frontend || !iframeRef.current) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      // Mock fetch for preview
      window.fetch = async (url, options) => {
        const body = options?.body ? JSON.parse(options.body) : {};
        const input = body.input || 'test';
        return {
          ok: true,
          json: async () => ({ success: true, output: 'Processed: ' + input.toUpperCase() })
        };
      };
      
      ${code.frontend
        .replace(/export\s+default\s+function\s+\w+/, 'function GeneratedApp')
        .replace(/export\s+default\s+\w+/, '')
        .replace(/import\s+.*from\s+['"].*['"];\n?/g, '')}
      
      ReactDOM.createRoot(document.getElementById('root')).render(<GeneratedApp />);
    } catch(e) {
      document.getElementById('root').innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Preview Error: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;

    iframeRef.current.srcdoc = htmlContent;
  }, [code]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-200">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-medium text-gray-600">Live Preview</span>
      </div>
      <div className="flex-1 bg-white">
        {code ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">Live preview will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
