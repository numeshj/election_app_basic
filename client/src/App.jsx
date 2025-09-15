import { useState, useEffect } from 'react'
import './styles.css'

function App() {
  const [results, setResults] = useState([])
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5001')  
    setSocket(ws)

    ws.addEventListener("open", (event) => {
      setIsConnected(true)
      console.log("WebSocket connected")
    })

    ws.addEventListener("message", (event) => {
      try {
        const incoming = JSON.parse(event.data)

        if (Array.isArray(incoming)) {
          setResults(incoming)  // initial History
        } else {
          setResults(prev => [incoming, ...prev]) 
        }
      } catch (error) {
        console.warn("Invalid message from server:", event.data)
      }
    })

    ws.addEventListener("close", (event) => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    })

    return () => {
      ws?.close()
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
              {results.map((item, index) => (
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

      <div className='full-data'>
        <h2>Full Data</h2>
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