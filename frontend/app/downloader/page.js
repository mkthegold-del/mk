'use client';
import { useState } from 'react';
export default function DownloaderPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const search = async () => {
    const res = await fetch('https://onrender.com' + query);
    const data = await res.json();
    setResults(data);
  };
  return (
    <div className='p-8 bg-gray-950 text-white min-h-screen'>
      <script src='https://tailwindcss.com'></script>
      <h2 className='text-2xl font-bold text-purple-400 mb-6'>Video Search & Downloader</h2>
      <div className='flex gap-2 mb-6'>
        <input type='text' className='flex-1 p-3 bg-gray-900 rounded outline-none' placeholder='Search video...' onChange={e => setQuery(e.target.value)} />
        <button onClick={search} className='bg-purple-600 px-6 rounded font-bold'>Search</button>
      </div>
      <div className='space-y-4'>
        {results.map((v, i) => <div key={i} className='p-4 bg-gray-900 rounded-xl flex justify-between'><span>{v.title}</span><button className='bg-green-600 px-3 py-1 rounded text-xs'>Download</button></div>)}
      </div>
    </div>
  );
}
