import React, { useState } from 'react';
import { ChatGPTClient } from '../services/ai';

export const TestChatGPT: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const client = new ChatGPTClient();

      // Test ChatGPT-compatible local API
      const result = await client.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant. Respond in English and be concise.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      });

      setResponse(result.choices[0].message.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-4'>Test ChatGPT Compatibility</h2>

      <form onSubmit={handleSubmit} className='mb-6'>
        <div className='mb-4'>
          <label htmlFor='message' className='block text-sm font-medium mb-2'>
            Message:
          </label>
          <textarea
            id='message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={4}
            placeholder='Type a message to test the local ChatGPT-compatible API...'
            disabled={loading}
          />
        </div>

        <button
          type='submit'
          disabled={loading || !message.trim()}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {error && (
        <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md'>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className='p-4 bg-gray-50 border border-gray-200 rounded-md'>
          <h3 className='font-semibold mb-2'>Response:</h3>
          <div className='whitespace-pre-wrap'>{response}</div>
        </div>
      )}

      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='font-semibold mb-2'>Info:</h3>
        <ul className='text-sm space-y-1'>
          <li>• This tests your local Ollama instead of ChatGPT</li>
          <li>• Ensure Ollama is installed and running</li>
          <li>
            • Pull model: <code>ollama pull llama3.2:3b-instruct-q4_K_M</code>
          </li>
          <li>• All data stays on your local machine</li>
        </ul>
      </div>
    </div>
  );
};
