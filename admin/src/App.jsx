import { useEffect, useState } from 'react'
import './styles.css'


function App() {

  const [results, setResults] = useState([])

  useEffect(() => {
    // create the WebSocket connection
    const socket = new WebSocket('ws://localhost:4001')

    // connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Hello Server!")
    })

    //listen for message
    socket.addEventListener("message", (event) => {
      console.log("Message from the server : ", event.data)
    })

    // Handle errors
    socket.addEventListener("error", (error) => {
      console.error("Websocket error : ", error)
    })

    return () => {
      socket.close();
    }
  }, [])


  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setResults(json);
        console.log("JSON Uploaded Successfully");
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
      </div>

      <div className='upload-container'>
        <input type="file" accept=".json" onChange={handleUpload} />
      </div>
    </div>
  )
}

export default App
