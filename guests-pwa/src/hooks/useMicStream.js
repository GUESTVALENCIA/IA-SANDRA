import { useEffect, useRef, useState } from 'react';

export default function useMicStream(wsUrl = 'ws://localhost:4747') {
  const wsRef = useRef(null);
  const mediaRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;
    ws.onopen = () => setReady(true);
    ws.onclose = () => setReady(false);
    return () => ws.close();
  }, [wsUrl]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    const src = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    src.connect(processor);
    processor.connect(ctx.destination);
    mediaRef.current = { ctx, stream, processor };
    processor.onaudioprocess = (e) => {
      const pcm = e.inputBuffer.getChannelData(0);
      // convert Float32→Int16 16 kHz
      const down = new Int16Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) down[i] = pcm[i] * 0x7fff;
      wsRef.current?.readyState === 1 && wsRef.current.send(down.buffer);
    };
  };

  const stop = () => {
    mediaRef.current?.stream.getTracks().forEach(t => t.stop());
    mediaRef.current?.processor.disconnect();
  };

  // Playback 24 kHz PCM16 from voice-agent
  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (e) => {
      if (typeof e.data === 'string') return;           // ignore JSON
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      ctx.decodeAudioData(e.data.slice(0), (buf) => {
        const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
      });
    };
  }, [ready]);

  return { ready, start, stop };
}

