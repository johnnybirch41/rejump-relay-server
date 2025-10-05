const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Rejump Relay Server is running!\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active rooms
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'join':
          handleJoin(ws, message);
          break;
        case 'sync':
          handleSync(ws, message);
          break;
        case 'leave':
          handleLeave(ws);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    handleLeave(ws);
    console.log('Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleJoin(ws, message) {
  const { room, player_id, player_name } = message;
  
  // Initialize room if it doesn't exist
  if (!rooms.has(room)) {
    rooms.set(room, new Map());
  }
  
  const roomClients = rooms.get(room);
  
  // Add client to room
  ws.room = room;
  ws.player_id = player_id;
  ws.player_name = player_name;
  roomClients.set(player_id, ws);
  
  console.log(`Player ${player_name} (${player_id}) joined room ${room}`);
  
  // Notify all clients in room about new player
  broadcast(room, {
    type: 'player_joined',
    player_id: player_id,
    player_name: player_name
  }, ws);
  
  // Send existing players to new client
  const existingPlayers = [];
  roomClients.forEach((client, id) => {
    if (id !== player_id && client.readyState === WebSocket.OPEN) {
      existingPlayers.push({
        player_id: id,
        player_name: client.player_name
      });
    }
  });
  
  if (existingPlayers.length > 0) {
    ws.send(JSON.stringify({
      type: 'existing_players',
      players: existingPlayers
    }));
  }
}

function handleSync(ws, message) {
  if (!ws.room) return;
  
  // Broadcast position update to all other clients in the room
  broadcast(ws.room, {
    type: 'sync',
    player_id: ws.player_id,
    p: message.p,  // position
    v: message.v,  // velocity
    s: message.s,  // score
    h: message.h,  // height
    c: message.c   // combo
  }, ws);
}

function handleLeave(ws) {
  if (!ws.room) return;
  
  const roomClients = rooms.get(ws.room);
  if (roomClients) {
    roomClients.delete(ws.player_id);
    
    // Notify others
    broadcast(ws.room, {
      type: 'player_left',
      player_id: ws.player_id
    }, ws);
    
    // Clean up empty rooms
    if (roomClients.size === 0) {
      rooms.delete(ws.room);
      console.log(`Room ${ws.room} closed (empty)`);
    }
  }
}

function broadcast(room, message, excludeWs = null) {
  const roomClients = rooms.get(room);
  if (!roomClients) return;
  
  const messageStr = JSON.stringify(message);
  roomClients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Rejump Relay Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});

// Keep alive
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);
