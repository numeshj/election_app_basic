const WebSocket = require("ws");
require("dotenv").config();

const PORT = process.env.PORT || 5001;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server is running at ws://localhost:${PORT}`);

let fullData = [];

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send all previous data to the new client
  ws.send(JSON.stringify(fullData));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Add upload timestamp
      data.timestamp = new Date().toISOString();

      // Save full data in server memory
      fullData.push(data);
      console.log("Data stored on server:", data);

      // Broadcast full data to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.log("Received non-JSON:", message.toString());
      ws.send("Invalid JSON format");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
