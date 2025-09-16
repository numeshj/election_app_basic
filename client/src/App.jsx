import { useState, useEffect, useRef } from 'react'
// import candidateList from './data/candidates-2024-presidental.json'; 
import './styles.css'

function App() {
  const [results, setResults] = useState([])
  // const [socket, setSocket] = useState(null)
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
          setResults(incoming)  // initial History
        } else {
          setResults(prev => [incoming, ...prev])
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

  // const candidateMap = {};
  // candidateList.forEach(candidate => {
  //   candidateMap[candidate.id] = candidate
  // })

  const islandTotal = {};
  const districtTotals = {};

  results.forEach(file => {
    const key = file.ed_code + "-" + file.ed_name;

    if (!districtTotals[key]) {
      districtTotals[key] = { hasDistrictTotal: false, votes: {} };
    }

    // If it ELECTORAL-DISTRICT, marking as final total
    if (file.level === "ELECTORAL-DISTRICT") {
      districtTotals[key].hasDistrictTotal = true;
      districtTotals[key].votes = {}; // reset before adding
      file.by_party.forEach(party => {
        districtTotals[key].votes[party.party_code] = party.votes;
      });
    }
    // only add if ELECTORAL-DISTRICT hasn't received
    else if (!districtTotals[key].hasDistrictTotal) {
      file.by_party.forEach(party => {
        if (!districtTotals[key].votes[party.party_code]) {
          districtTotals[key].votes[party.party_code] = 0;
        }
        districtTotals[key].votes[party.party_code] += party.votes;
      });
    }
  });


  // Calculate island total from final district totals
  Object.values(districtTotals).forEach(district => {
    Object.entries(district.votes).forEach(([party, votes]) => {
      if (!islandTotal[party]) {
        islandTotal[party] = 0;
      }
      islandTotal[party] += votes;
    });
  });


  // Sort island total
  const sortedIsland = Object.entries(islandTotal)
    .map(([party, votes]) => ({ party, votes }))
    .sort((a, b) => b.votes - a.votes);

  // Sort dstric total
  const sortedDistricts = Object.entries(districtTotals).map(([key, data]) => {
    return {
      district: key,
      parties: Object.entries(data.votes)
        .map(([party, votes]) => ({ party, votes }))
        .sort((a, b) => b.votes - a.votes)
    };
  });

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