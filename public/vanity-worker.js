// Web Worker for vanity address generation
// This worker ONLY generates random private keys and sends them to the main thread.
// The main thread uses ethers.js to derive the correct addresses.

function toHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generatePrivateKey() {
  const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  return '0x' + toHex(privateKeyBytes);
}

let isRunning = false;

self.onmessage = function(e) {
  const { prefix: prefixInput } = e.data;
  if (!isRunning) {
    isRunning = true;
    const prefix = prefixInput.toLowerCase();
    let attempts = 0;
    
    function run() {
      for (let i = 0; i < 500; i++) {
        attempts++;
        const privateKey = generatePrivateKey();
        self.postMessage({ type: 'candidate', privateKey, attempts });
      }
      if (isRunning) {
        setTimeout(run, 0);
      }
    }
    
    run();
  }
};
