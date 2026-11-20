/* Worker for tools/origins/lib.js pool(): runs one task and posts the result back. */
const { parentPort } = require('worker_threads');
const path = require('path');
parentPort.on('message', ({ id, task }) => {
  try {
    const mod = require(task.mod ? path.resolve(__dirname, task.mod) : './lib.js');
    const out = mod[task.fn || 'duel'](task);
    parentPort.postMessage({ id, out });
  } catch (e) {
    parentPort.postMessage({ id, err: String((e && e.stack) || e) });
  }
});
