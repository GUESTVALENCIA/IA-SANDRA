// AudioWorklet para procesamiento de audio en tiempo real
// Reemplaza ScriptProcessorNode deprecado

class VoiceProcessor extends AudioWorkletProcessor {
  process(inputs) {
    // inputs[0][0] es el canal de audio principal
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      // Enviar datos de audio al thread principal
      this.port.postMessage({
        audioData: channelData,
        sampleRate: 48000
      });
    }
    return true; // Mantener el procesador activo
  }
}

registerProcessor('voiceProcessor', VoiceProcessor);

