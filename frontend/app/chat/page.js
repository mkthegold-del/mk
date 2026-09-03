'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
let socket;
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [liveUsers, setLiveUsers] = useState([]);
  const [username, setUsername] = useState('User');
  useEffect(() => {
    socket = io('https://onrender.com');
    socket.emit('join-room', { password: 'Mk25@24nk', location: 'Kigali, Rwanda' });
    socket.on('login-success', (data) => setUsername(data.username));
    socket.on('room-users', (users) => setLiveUsers(users));
    socket.on('receive-message', (msg) => setMessages(prev => [...prev, msg]));
  }, []);
  const send = () => {
    if (msgInput.trim()) {
      socket.emit('send-message', { sender: username, text: msgInput });
      setMsgInput('');
    }
  };
  return (
    <div className='flex h-screen bg-gray-950 text-white p-4'>
      <script src='https://tailwindcss.com'></script>
      <div className='w-1/4 bg-gray-900 p-4 rounded-xl border border-gray-800'>
        <h3 className='text-lg font-bold text-pink-400 mb-4'>Live Abahari ({liveUsers.length})</h3>
        {liveUsers.map((u, i) => <div key={i} className='p-2 bg-gray-800 rounded mb-2 text-xs'>🟢 {u.username}</div>)}
      </div>
      <div className='flex-1 flex flex-col justify-between ml-4 bg-gray-900 rounded-xl p-4'>
        <div className='border-b border-gray-800 pb-2'><span className='font-bold text-pink-400'>Xanny Chat Room</span></div>
        <div className='flex-1 overflow-y-auto my-4 space-y-2'>{messages.map((m, i) => <div key={i} className='p-2 bg-gray-800 rounded-xl max-w-xs'>{m.text}</div>)}</div>
        <div className='flex gap-2'>
          <input type='text' value={msgInput} className='flex-1 p-2 bg-gray-800 rounded outline-none' onChange={e => setMsgInput(e.target.value)} />
          <button onClick={send} className='bg-pink-500 px-4 rounded font-bold'>Send</button>
        </div>
      </div>
    </div>
  );
}
