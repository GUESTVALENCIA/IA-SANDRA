import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Brand from './Brand.jsx';
import Privacy from './pages/Privacy.jsx';
import Tos from './pages/Tos.jsx';
import useMicStream from './hooks/useMicStream.js';

export default function App() {
  const [logs,setLogs] = useState([]);
  const { ready, start, stop } = useMicStream();

  return (
    <BrowserRouter>
      <Brand/>
      <nav style={{padding:'8px 16px',background:'#f0fdf4'}}>
        <Link to="/" style={{marginRight:12}}>Home</Link>
        <Link to="/privacy" style={{marginRight:12}}>Privacy</Link>
        <Link to="/tos">TOS</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <div style={{padding:20}}>
            <h3>Chat / Voz</h3>
            <button disabled={!ready} onClick={start}>🎙️ Hablar</button>
            <button onClick={stop} style={{marginLeft:8}}>⛔ Parar</button>
            <pre style={{background:'#eef',padding:6}}>{logs.join('\n')}</pre>
          </div>
        }/>
        <Route path="/privacy" element={<Privacy/>}/>
        <Route path="/tos" element={<Tos/>}/>
      </Routes>
    </BrowserRouter>
  );
}
