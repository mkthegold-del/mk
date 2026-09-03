'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [liveUsers, setLiveUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [aiLang, setAiLang] = useState('kinyarwanda');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      socket = io('http://localhost:5000');
      navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('join-room', { username, password, location: `Lat: ${pos.coords.latitude.toFixed(2)}, Lng: ${pos.coords.longitude.toFixed(2)}` });
      }, () => {
        socket.emit('join-room', { username, password, location: 'Unknown' });
      });
      socket.on('room-users', (users) => setLiveUsers(users));
      socket.on('receive-message', (msg) => setMessages(prev => [...prev, msg]));
      socket.on('incoming-video-call', (data) => setIncomingCall(data));
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Mk25@24nk') setIsLoggedIn(true);
    else alert('Password si yo!');
  };

  const handleSendMessage = () => {
    if (msgInput.trim()) {
      socket.emit('send-message', { sender: username, text: msgInput });
      setMsgInput('');
    }
  };

  const handleSearchVideo = async () => {
    const res = await fetch(`http://localhost:5000/api/search?q=${searchQuery}`);
    const data = await res.json();
    setSearchResults(data);
  };

  const fetchAiLove = async (type) => {
    const res = await fetch('http://localhost:5000/api/ai-love', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: aiLang, type })
    });
    const data = await res.json();
    setAiResponse(data.result);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <script src="https://tailwindcss.com"></script>
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 text-center border border-purple-500/30">
          <h2 className="text-3xl font-extrabold mb-6 text-pink-400">Xanny Chat</h2>
          <input type="text" placeholder="Izina ryawe" required className="w-full p-3 mb-4 bg-gray-700 rounded-lg text-white outline-none" onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password y'Icyumba" required className="w-full p-3 mb-6 bg-gray-700 rounded-lg text-white outline-none" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-pink-500 hover:bg-pink-600 p-3 rounded-lg font-bold transition">Fungura</button>
        </form>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans">
      <script src="https://tailwindcss.com"></script>
      <div className="w-20 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-8 gap-6">
        <button onClick={() => setActiveTab('chat')} className={`p-3 rounded-xl transition ${activeTab === 'chat' ? 'bg-pink-500' : 'bg-gray-800'}`}>💬</button>
        <button onClick={() => setActiveTab('video')} className={`p-3 rounded-xl transition ${activeTab === 'video' ? 'bg-purple-500' : 'bg-gray-800'}`}>📺</button>
        <button onClick={() => setActiveTab('ai')} className={`p-3 rounded-xl transition ${activeTab === 'ai' ? 'bg-blue-500' : 'bg-gray-800'}`}>🤖</button>
      </div>
      <div className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <div className="flex flex-1">
            <div className="w-1/4 bg-gray-900 p-4 border-r border-gray-800">
              <h3 className="text-lg font-bold text-pink-400 mb-4">Abari Live ({liveUsers.length})</h3>
              <div className="space-y-2">
                {liveUsers.map((u, i) => (
                  <div key={i} className="p-2 bg-gray-800 rounded-lg text-sm">
                    <p className="font-bold text-green-400">● {u.username}</p>
                    <p className="text-xs text-gray-400">📍 {u.location}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between">
                <span className="font-bold">Chat Live Room</span>
                <button onClick={() => socket.emit('start-video-call', { from: username })} className="bg-purple-600 px-4 py-1.5 rounded-lg text-sm font-bold">📹 Video Call</button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === username ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500">{m.sender}</span>
                    <div className={`p-2.5 rounded-xl max-w-xs ${m.sender === username ? 'bg-pink-500' : 'bg-gray-800'}`}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-900 flex gap-2">
                <input type="text" value={msgInput} placeholder="Andika message..." className="flex-1 p-3 bg-gray-800 rounded-lg outline-none" onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} className="bg-pink-500 px-6 rounded-lg font-bold">Send</button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'video' && (
          <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-purple-400">Video Search & Downloader</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Shaka video muli YouTube..." value={searchQuery} className="flex-1 p-3 bg-gray-800 rounded-lg outline-none" onChange={e => setSearchQuery(e.target.value)} />
              <button onClick={handleSearchVideo} className="bg-purple-600 px-6 rounded-lg font-bold">Search</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {searchResults.map((v, i) => (
                  <div key={i} className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex justify-between items-center">
                    <div><h4 className="font-bold text-sm max-w-xs truncate">{v.title}</h4></div>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentVideo(v)} className="bg-blue-600 p-2 rounded-lg text-xs font-bold">Preview</button>
                      <a href={`http://localhost:5000/api/download?url=${v.url}`} download className="bg-green-600 p-2 rounded-lg text-xs font-bold">Download</a>
                    </div>
                  </div>
                ))}
              </div>
              {currentVideo && (
                <div className="bg-gray-900 p-4 rounded-xl border border-purple-500/30 flex flex-col gap-4">
                  <h3 className="font-bold text-purple-300">{currentVideo.title}</h3>
                  <div className="bg-black aspect-video rounded-lg flex items-center justify-center text-gray-500">[Preview Player]</div>
                  <button onClick={() => alert('Iri gukina ijya ku ikurikira!')} className="bg-gray-800 p-2.5 rounded-lg text-sm font-semibold">Play Next ➡️</button>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'ai' && (
          <div className="p-8 max-w-2xl mx-auto flex flex-col gap-6 justify-center h-full">
            <h2 className="text-3xl font-extrabold text-blue-400 text-center">🤖 AI Love Guru (Free)</h2>
            <div className="flex justify-center gap-4">
              <select value={aiLang} onChange={e => setAiLang(e.target.value)} className="p-3 bg-gray-800 rounded-lg text-white outline-none font-semibold">
                <option value="kinyarwanda">🇷🇼 Kinyarwanda</option>
                <option value="english">🇺🇸 English</option>
                <option value="francais">🇫🇷 Français</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button onClick={() => fetchAiLove('imitoma')} className="flex-1 bg-pink-600 hover:bg-pink-700 p-4 rounded-xl font-bold text-lg transition shadow-lg">💖 Zana Umutoma</button>
              <button onClick={() => fetchAiLove('inama')} className="flex-1 bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold text-lg transition shadow-lg">💡 Zana Inama</button>
            </div>
            {aiResponse && <div className="p-6 bg-gray-900 rounded-2xl border border-blue-500/20 text-center text-xl italic text-gray-100 shadow-inner">"{aiResponse}"</div>}
          </div>
        )}
      </div>
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-gray-900 p-8 rounded-2xl border border-purple-500 text-center max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-2">Hamagara Ifunguye!</h3>
            <p className="text-gray-300 mb-6"><span className="text-green-400 font-bold">{incomingCall.from}</span> ari kuguhamagara kuri Video...</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => alert('Wemeye video call!')} className="bg-green-500 hover:bg-green-600 px-6 py-2.5 rounded-xl font-bold transition">Join</button>
              <button onClick={() => setIncomingCall(null)} className="bg-red-500 hover:bg-red-600 px-6 py-2.5 rounded-xl font-bold transition">Not</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
