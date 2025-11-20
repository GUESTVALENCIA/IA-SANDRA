import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [messages, setM] = useState([]);
  const wsRef = useRef(null);
  const [connected, setConn] = useState(false);

  const send = (txt) => {
    setM(m => [...m, { role: 'user', txt }]);
    wsRef.current && wsRef.current.send(JSON.stringify({ type: 'user', text: txt }));
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4747');
    ws.onopen = () => setConn(true);
    ws.onmessage = (e) => {
      const d = typeof e.data === 'string' ? JSON.parse(e.data) : null;
      if (d?.response?.text) {
        setM(m => [...m, { role: 'assistant', txt: d.response.text }]);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h3>Guests-Valencia PWA</h3>
      <div style={{ minHeight: 200, border: '1px solid #ccc', padding: 10 }}>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.role === 'user' ? '👤' : '🤖'}:</b> {m.txt}
          </p>
        ))}
      </div>
      <input id="msg" placeholder="Escribe…" style={{ width: '80%' }} />
      <button disabled={!connected} onClick={() => send(document.getElementById('msg').value)}>
        Enviar
      </button>
    </div>
  );
}
