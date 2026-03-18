// Web Worker for vanity address generation
importScripts('https://cdn.ethers.org/lib/ethers-5.umd.min.js');

let isRunning = false;
let attemptCount = 0;

self.onmessage = async (e) => {
  const { action, prefix } = e.data;

  if (action === 'start') {
    isRunning = true;
    attemptCount = 0;
    const prefixLower = prefix.toLowerCase();
    
    try {
      while (isRunning) {
        const wallet = ethers.Wallet.createRandom();
        attemptCount++;

        // Check if address starts with prefix (0x + prefix)
        if (wallet.address.toLowerCase().startsWith('0x' + prefixLower)) {
          // Found a match!
          self.postMessage({
            type: 'found',
            wallet: {
              address: wallet.address,
              privateKey: wallet.privateKey,
            },
          });
          break;
        }

        // Send progress every 500 attempts
        if (attemptCount % 500 === 0) {
          self.postMessage({
            type: 'progress',
            attemptCount,
          });
        }
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message,
      });
    }
  } else if (action === 'stop') {
    isRunning = false;
    self.postMessage({
      type: 'stopped',
      attemptCount,
    });
  }
};
