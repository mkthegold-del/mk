const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PASSWORD = "Mk25@24nk";
let activeUsers = {};
let userCount = 0;

// Gutangiza Bot ya Telegram binyuze kuri API credentials watanze
// Hano ushobora gushyiramo Bot Token yawe kugira ngo itume byandika kuri Telegram yawe
const bot = new Telegraf('22859414:215ab82a55eab4a7d4ea567916eff1c6'); 

// 1. YT-DLP Search Engine API (Icyumba cya 2)
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Andika icyo ushaka!" });

  const cmd = `yt-dlp "ytsearch5:${query}" --dump-json --flat-playlist`;
  exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
    if (error) return res.status(500).json({ error: error.message });
    try {
      const videos = stdout.trim().split('\n').map(line => {
        const json = JSON.parse(line);
        return { id: json.id, title: json.title, url: `https://youtube.com{json.id}` };
      });
      res.json(videos);
    } catch (e) { res.status(500).json({ error: "Kuba paje byanze" }); }
  });
});

// 2. AI Love Engine API (Icyumba cya 3)
const imitomaData = {
  kinyarwanda: {
    imitoma: ["Umutima wanjye ubyina injyana y'urukundo iyo ntekereje amaso yawe.", "Uri urumuri rumurikira ijoro ryanjye rwijimye. Ndagukunda!"],
    inama: ["Urukundo rw'ukuri ntirwishingikiriza ku kurebana, ahubwo rureba mu cyerekezo kimwe."]
  },
  english: {
    imitoma: ["My heart beats only for you, you are my code and my life.", "You are the sunshine that lights up my darkest days."],
    inama: ["Communication is the water that keeps the tree of love growing."]
  },
  francais: {
    imitoma: ["Mon cœur bat au rythme de ton amour, tu es mon univers."],
    inama: ["L'amour ne consiste pas à se regarder l'un l'autre, mais à regarder ensemble."]
  }
};

app.post('/api/ai-love', (req, res) => {
  const { language, type } = req.body;
  const langData = imitomaData[language] || imitomaData['kinyarwanda'];
  const list = langData[type] || langData['imitoma'];
  const randomIndex = Math.floor(Math.random() * list.length);
  res.json({ result: list[randomIndex] });
});

// WebSockets - Kumenya abari Live na Video Call
io.on('connection', (socket) => {
  
  socket.on('join-room', ({ password, location }) => {
    if (password !== PASSWORD) return socket.emit('login-error', 'Password saryo!');
    userCount++;
    const generatedUsername = `User-${userCount}`;
    activeUsers[socket.id] = { id: socket.id, username: generatedUsername, location };
    
    socket.emit('login-success', { username: generatedUsername });
    io.emit('room-users', Object.values(activeUsers));
  });

  socket.on('send-message', async (data) => {
    io.emit('receive-message', data);
    
    // KUBIKA KURI TELEGRAM: Ibi bihita byoherereza amakuru yose kuri Telegram channel/chat yawe
    try {
      await bot.telegram.sendMessage('-10022859414', `💌 [Xanny Chat]\n👤 ${data.sender}\n💬 ${data.text}`);
    } catch (e) { console.log("Telegram Error: ", e.message); }
  });

  socket.on('start-video-call', (data) => {
    socket.broadcast.emit('incoming-video-call', { from: data.from, signal: data.signal });
  });

  socket.on('accept-video-call', (data) => {
    socket.broadcast.emit('video-call-accepted', data.signal);
  });

  socket.on('disconnect', () => {
    delete activeUsers[socket.id];
    io.emit('room-users', Object.values(activeUsers));
  });
});

server.listen(5000, () => console.log('Backend server running on port 5000'));
