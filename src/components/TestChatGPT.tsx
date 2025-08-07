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

      // Testaa ChatGPT API -kompatiibeli rajapinta
      const result = await client.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Olet hyödyllinen assistentti. Vastaa suomeksi ja ole ytimekäs.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      });

      setResponse(result.choices[0].message.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tuntematon virhe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-4'>
        Testaa ChatGPT-kompatiibiliteetti
      </h2>

      <form onSubmit={handleSubmit} className='mb-6'>
        <div className='mb-4'>
          <label htmlFor='message' className='block text-sm font-medium mb-2'>
            Viesti:
          </label>
          <textarea
            id='message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={4}
            placeholder='Kirjoita viesti testataksesi paikallista ChatGPT:tä...'
            disabled={loading}
          />
        </div>

        <button
          type='submit'
          disabled={loading || !message.trim()}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
          {loading ? 'Lähetetään...' : 'Lähetä'}
        </button>
      </form>

      {error && (
        <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md'>
          <strong>Virhe:</strong> {error}
        </div>
      )}

      {response && (
        <div className='p-4 bg-gray-50 border border-gray-200 rounded-md'>
          <h3 className='font-semibold mb-2'>Vastaus:</h3>
          <div className='whitespace-pre-wrap'>{response}</div>
        </div>
      )}

      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='font-semibold mb-2'>Tietoa:</h3>
        <ul className='text-sm space-y-1'>
          <li>• Tämä testaa paikallista Ollamaa ChatGPT:n sijaan</li>
          <li>• Varmista että Ollama on asennettu ja käynnissä</li>
          <li>
            • Asenna malli: <code>ollama pull llama3.2:3b-instruct-q4_K_M</code>
          </li>
          <li>• Kaikki data pysyy paikallisella koneellasi</li>
        </ul>
      </div>
    </div>
  );
};
