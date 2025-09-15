import { useState, useEffect } from 'react'


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
      ws.send("Client : Hello Server!")
    })

    //listen for message
    ws.addEventListener("message", (event) => {
      try { 
        const incoming = JSON.parse(event.data)
        setResults(prev => [...prev, incoming])
        console.log("Message from the server : ", event.data)

      } catch {
        console.log("Non-JSON message from the server : ", event.data)
      }
      
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

  return (
    <>
      <div className='header-container'>
        <h1>Client</h1>
      </div>

      <div className='json-table'>
        {results.length === 0 ? (
          <p>No data received yet</p>
        ) : (
            results.map((item, index) => (
              <pre key={index}>{JSON.stringify(item, null, 2)}</pre>
            ))
        )}

      </div>
    </>
  )
}

export default App
