import { useState, useEffect } from 'react'
import candidateList from './data/candidates-2024-presidental.json';
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

  const candidateMap = {};
  candidateList.forEach(candidate => {
    candidateMap[candidate.id] = candidate
  })

  const districtTotals = {};

  results.forEach(file => {
    // check only these levels
    if (file.level === "ELECTORAL-DISTRICT" || file.level === "POLLING-DIVISION") {
      const key = file.ed_code + "-" + file.ed_name;

      // create empty district if not exists
      if (!districtTotals[key]) {
        districtTotals[key] = {};
      }

      // add votes per party
      file.by_party.forEach(party => {
        if (!districtTotals[key][party.party_code]) {
          districtTotals[key][party.party_code] = 0;
        }
        districtTotals[key][party.party_code] += party.votes;
      });
    }
  });

  const islandTotal = {};

  results.forEach(file => {
    if (file.level === "ELECTORAL-DISTRICT") {
      file.by_party.forEach(party => {
        if (!islandTotal[party.party_code]) {
          islandTotal[party.party_code] = 0; // first time
        }
        islandTotal[party.party_code] += party.votes; // add votes
      });
    }
  });

  const sortedDistricts = Object.entries(districtTotals).map(([district, parties]) => {
    return {
      district,
      parties: Object.entries(parties)
        .map(([party, votes]) => ({ party, votes }))
        .sort((a, b) => b.votes - a.votes) // highest first
    };
  });

  // Sort island total
  const sortedIsland = Object.entries(islandTotal)
    .map(([party, votes]) => ({ party, votes }))
    .sort((a, b) => b.votes - a.votes);

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

      <div>
        <h2>Island Total</h2>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Party</th>
              <th>Total Votes</th>
            </tr>
          </thead>
          <tbody>
            {sortedIsland.map((p, i) => (
              <tr key={i}>
                <td>{p.party}</td>
                <td>{p.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      <div>
        <h2>District Totals</h2>
        {sortedDistricts.map((dist, idx) => (
          <div key={idx}>
            <h3>{dist.district}</h3>
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Party</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {dist.parties.map((p, i) => (
                  <tr key={i}>
                    <td>{p.party}</td>
                    <td>{p.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
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