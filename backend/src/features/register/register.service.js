import * as streamManager from '../../utils/stream-manager.js';
import sleep from '../../utils/sleep.js';

let workerRunning = false;

export async function monitorRegistry(intervalMs) {
  if (workerRunning) return;

  workerRunning = true;
  console.log('Registry monitor worker has started');

  try {
    while (streamManager.hasRegistrations()) {
      await sleep(intervalMs);

      streamManager.timeoutStreams();
    }
  } catch (err) {
    console.error('Registry monitor worker:', err);
  } finally {
    workerRunning = false;
    console.log('Registry monitor worker has stopped');
  }
}
