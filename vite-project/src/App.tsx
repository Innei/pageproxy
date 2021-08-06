import React, { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios'

import ReactIcon from '../react.png'
function App() {
  const [count, setCount] = useState(0)
  // const [message, setMessage] = useState('')
  const [payload, setPayload] = useState('')
  useEffect(() => {
    axios.get(`${window.context.apiUrl}/master`).then((res) => {
      setPayload(res.data)
    })
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <img src={ReactIcon} alt="react-icon" />
        <p style={{ fontSize: '14px' }}>payload: {JSON.stringify(payload)}</p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
