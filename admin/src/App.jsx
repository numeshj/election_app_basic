import { useEffect, useState } from 'react'
import './styles.css'

function App() {

  const [results, setResults] = useState([])
  const [socket, setSocket] = useState(null)  
  const [isConnected, setIsConnected] = useState(false); 

  useEffect(() => {
    // create the WebSocket connection
    const ws = new WebSocket('ws://localhost:5002')
    setSocket(ws)

    // connection opened
    ws.addEventListener("open", (event) => {
      setIsConnected(true)
      console.log("WebSocket connected")
      ws.send("Admin : Hello Server!")
    })

    //listen for message
    ws.addEventListener("message", (event) => {
      console.log("Message from the server : ", event.data) 
    })

    // Handle errors
    ws.addEventListener("error", (error) => {
      console.error("WebSocket error : ", error) 
      setIsConnected(false)
    })

    ws.addEventListener("close", (event) => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    })

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // handling upload
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setResults(json);
        console.log("JSON Uploaded Successfully");

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(json))
        } else {
          console.warn("WebSocket not connected, cannot send JSON")
        }       

      } catch (error) {
        console.log("Invalid JSON ;", error)
      }
    }
    reader.readAsText(file);
  }

  return (
    <div className='election-container'>
      <div className='election-header'>
        <h1 className='topic'>Admin Dashboard</h1>
        <p>WebSocket Status : {isConnected ? "Connected" : "Disconnected"}</p>
      </div>

      <div className='upload-container'>
        <input type="file" accept=".json" onChange={handleUpload} />
      </div>
    </div>
  )
}

export default App