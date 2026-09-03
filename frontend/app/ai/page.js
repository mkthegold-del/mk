'use client';
import { useState } from 'react';
export default function AiPage() {
  const [lang, setLang] = useState('kinyarwanda');
  const [response, setResponse] = useState('');
  const fetchAi = async (type) => {
    const res = await fetch('https://onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, type })
    });
    const data = await res.json();
    setResponse(data.result);
  };
  return (
    <div className='p-8 bg-gray-950 text-white min-h-screen flex flex-col items-center justify-center'>
      <script src='https://tailwindcss.com'></script>
      <h2 className='text-3xl font-extrabold text-blue-400 mb-6'>🤖 AI Love Guru</h2>
      <div className='flex gap-4 mb-6'>
        <button onClick={() => fetchAi('imitoma')} className='bg-pink-600 px-6 py-3 rounded-xl font-bold'>💖 Umutoma</button>
      </div>
      {response && <div className='p-6 bg-gray-900 rounded-xl'>"{response}"</div>}
    </div>
  );
}
