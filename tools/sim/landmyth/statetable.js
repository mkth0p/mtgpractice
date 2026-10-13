'use strict';
// Open-addressing hash table of fixed-width byte states -> probability mass.
// No per-state JS objects or strings, so tens of millions of states fit in a few GB
// (a JS Map tops out at 2^24 entries). Memory: W bytes + 8 (mass) + ~8 (slots) per state.

class StateTable {
  constructor(W, cap = 1 << 12) {
    this.W = W; this.n = 0;
    this.cap = cap; this.mask = cap - 1;
    this.slots = new Int32Array(cap).fill(-1);
    this.dcap = cap >> 1;
    this.data = new Uint8Array(this.dcap * W);
    this.mass = new Float64Array(this.dcap);
  }
  hash(buf, off) {
    let h = 0x811c9dc5 | 0;
    for (let i = 0; i < this.W; i++) { h ^= buf[off + i]; h = Math.imul(h, 0x01000193); }
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
    return h >>> 0;
  }
  // Add mass p to state s (Uint8Array of length W). Returns the state's index.
  add(s, p) {
    const W = this.W, data = this.data;
    let h = this.hash(s, 0) & this.mask;
    for (;;) {
      const idx = this.slots[h];
      if (idx < 0) break;
      const o = idx * W;
      let eq = true;
      for (let i = 0; i < W; i++) if (data[o + i] !== s[i]) { eq = false; break; }
      if (eq) { this.mass[idx] += p; return idx; }
      h = (h + 1) & this.mask;
    }
    if (this.n >= this.dcap) { this.grow(); return this.add(s, p); }
    const idx = this.n++;
    this.data.set(s, idx * W);
    this.mass[idx] = p;
    this.slots[h] = idx;
    return idx;
  }
  grow() {
    const W = this.W;
    this.cap <<= 1; this.mask = this.cap - 1;
    this.slots = new Int32Array(this.cap).fill(-1);
    this.dcap = this.cap >> 1;
    const d = new Uint8Array(this.dcap * W); d.set(this.data); this.data = d;
    const m = new Float64Array(this.dcap); m.set(this.mass); this.mass = m;
    for (let idx = 0; idx < this.n; idx++) {
      let h = this.hash(this.data, idx * W) & this.mask;
      while (this.slots[h] >= 0) h = (h + 1) & this.mask;
      this.slots[h] = idx;
    }
  }
  state(idx) { return this.data.subarray(idx * this.W, (idx + 1) * this.W); }
  bytes() { return this.slots.byteLength + this.data.byteLength + this.mass.byteLength; }
}

module.exports = { StateTable };
