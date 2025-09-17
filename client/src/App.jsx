import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useElectionData } from './hooks/useElectionData'
import { IslandTotal } from './components/IslandTotal'
import { DistrictTotals } from './components/DistrictTotals'

function App() {
  const [results, setResults] = useState([])
  const ws = useRef(null)
  const [isConnected, setIsConnected] = useState(false)


  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return

    ws.current = new WebSocket('ws://localhost:5001')

    ws.current.addEventListener("open", (event) => {
      setIsConnected(true)
      console.log("WebSocket connected")
    })

    ws.current.addEventListener("message", (event) => {
      try {
        const incoming = JSON.parse(event.data)

        if (Array.isArray(incoming)) {
          setResults(incoming.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))  // sort latest first
        } else {
          setResults(prev => [incoming, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))  // add to top and sort
        }
      } catch (error) {
        console.warn("Invalid message from server:", event.data)
      }
    })

    ws.current.addEventListener("close", (event) => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    })

    return () => {
      ws.current?.close()
    }
  }, [])

  const {sortedIsland, sortedDistricts} = useElectionData(results)

  return (
    <>
      <div className='header-container'>
        <h1>Client</h1>
      </div>

      {/* Summary Table (unchanged)... */}

      <IslandTotal sortedIsland={sortedIsland} />
      <DistrictTotals sortedDistricts={sortedDistricts} />

      {/* Full Data (unchanged)... */}
    </>
  )
}

export default App