import { useEffect, useState, useRef } from 'react'
import './styles.css'

function App() {
  const [results, setResults] = useState([])
  const ws = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [summaryList, setSummaryList] = useState([])
  const reconnectTimeout = useRef(null)

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return

    console.log("Connecting to WebSocket...")
    ws.current = new WebSocket('ws://localhost:5001')

    ws.current.addEventListener("open", (event) => {
      setIsConnected(true)
      console.log("WebSocket connected")
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
        reconnectTimeout.current = null
      }
    })

    ws.current.addEventListener("message", (event) => {
      try {
        const incoming = JSON.parse(event.data);
        if (Array.isArray(incoming)) {
          setSummaryList(incoming.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // sort latest first
        } else {
          setSummaryList(prev => [incoming, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // add to top and sort
        }

      } catch (error) {
        console.warn("Invalid message from server:", event.data);
      }
    });

    ws.current.addEventListener("close", (event) => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
      reconnectTimeout.current = setTimeout(connectWebSocket, 3000)
    })
  }

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (ws.current) ws.current.close()
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    }
  }, [])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        setResults(json)
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(json))
        } else {
          console.warn("WebSocket not connected, cannot send JSON")
        }
      } catch (error) {
        console.log("Invalid JSON ;", error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <div className='election-container'>
        <div className='election-header'>
          <h1 className='topic'>Admin Dashboard</h1>
          <p>WebSocket Status: {isConnected ? "Connected" : "Disconnected"}</p>
        </div>

        <div className='upload-container'>
          <input type="file" accept=".json" onChange={handleUpload} />
        </div>
      </div>

      <div className='summary-container'>
        <h2>Uploaded History</h2>
        {summaryList.length === 0 ? (
          <p>No uploads yet</p>
        ) : (
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>ED Code</th>
                <th>ED Name</th>
                <th>PD Code</th>
                <th>PD Name</th>
              </tr>
            </thead>
            <tbody>
              {summaryList.map((item, index) => (
                <tr key={index}>
                  <td>{item.timestamp}</td>
                  <td>{item.level}</td>
                  <td>{item.ed_code}</td>
                  <td>{item.ed_name}</td>
                  <td>{item.pd_code}</td>
                  <td>{item.pd_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App