// Microphone capture for the Gemini Live call: any input rate -> 16 kHz mono PCM16, posted in ~40 ms chunks (+ RMS level).
class LiveCapture extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / 16000; this.pos = 0; this.buf = []; this.sum = 0; this.n = 0; }
  process(inputs) {
    const x = inputs[0] && inputs[0][0];
    if (!x) return true;
    for (let i = 0; i < x.length; i++) { this.sum += x[i] * x[i]; this.n++; }
    // linear resample by position accumulator
    while (this.pos < x.length) {
      const i = Math.floor(this.pos), f = this.pos - i, a = x[i], b = i + 1 < x.length ? x[i + 1] : a;
      const v = Math.max(-1, Math.min(1, a + (b - a) * f));
      this.buf.push(v < 0 ? v * 0x8000 : v * 0x7fff);
      this.pos += this.ratio;
    }
    this.pos -= x.length;
    if (this.buf.length >= 640) {
      const pcm = Int16Array.from(this.buf); this.buf = [];
      this.port.postMessage({ pcm: pcm.buffer, rms: Math.sqrt(this.sum / Math.max(1, this.n)) }, [pcm.buffer]);
      this.sum = 0; this.n = 0;
    }
    return true;
  }
}
registerProcessor('live-capture', LiveCapture);
