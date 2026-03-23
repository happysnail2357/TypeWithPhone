import * as streamManager from '../../utils/stream-manager.js';
import { monitorRegistry } from './register.service.js';

export async function register(req, res, _next) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  try {
    console.log(req.ip + ' is attempting to register');

    const code = streamManager.newRegistration(req.ip, res);
    streamManager.writeToStream(res, { type: 'registration', code: code });

    console.log(req.ip + ' has registered');
  } catch (e) {
    if (e instanceof streamManager.IpLimitError) {
      console.warn('Ip address attempted re-registration: ' + req.ip);
      res.status(429).json({ type: 'error', message: e.message });
    } else if (e instanceof streamManager.ConnectionLimitError) {
      console.warn('Connection limit hit');
      res.status(503).json({ type: 'error', message: e.message });
    } else {
      throw e;
    }

    return;
  }

  monitorRegistry(60001);

  req.on('close', () => {
    console.log('Stream has been closed: ' + req.ip);
    streamManager.clearRegistration(req.ip);
  });
}
