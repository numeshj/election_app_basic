const WebSocket = require("ws");

const PORT = process.env.PORT || 5002;

const wss = new WebSocket.Server({ port: PORT }); 

console.log(`WebSocket server is running at ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
      try {
          const data = JSON.parse(message);
          console.log("Received JSON : ", data)

          // send to all clients
          wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(data));
              }
          })
          
      } catch (error) {
          console.log("received non-JSON : ", message.toString())
          ws.send("Invalid JSON format")
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
