export class IpLimitError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'IpLimitError';
  }
}

export class ConnectionLimitError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'ConnectionLimitError';
  }
}

const MAX_REGISTRATIONS = 150;
const HEAVY_LOAD = 100;
const registry = new Map();

function getRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = chars[randomValues[i] % chars.length];
  }

  return result.join('');
}

export function newRegistration(address, stream) {
  if (registry.has(address)) throw new IpLimitError('IP address has already been registered');

  if (registry.size >= MAX_REGISTRATIONS)
    throw new ConnectionLimitError('Server cannot accept new registrations at the moment');

  const code = getRandomCode();

  let registration = {
    stream: stream,
    code: code,
    idle: true,
    created: Date.now(),
  };

  registry.set(address, registration);

  return code;
}

export function getStream(address, code) {
  if (registry.has(address)) {
    let reg = registry.get(address);

    if (reg.code === code) {
      reg.idle = false;
      return reg.stream;
    }
  }

  return null;
}

export function writeToStream(stream, obj) {
  stream.write(JSON.stringify(obj) + '\n');
}

export function clearRegistration(address) {
  if (registry.has(address)) {
    registry.delete(address);
  }
}

export function timeoutStreams() {
  const timeout = registry.size >= HEAVY_LOAD ? 300 : 600;
  const timeoutIdle = registry.size >= HEAVY_LOAD ? 150 : 300;
  const now = Date.now();

  for (const [key, value] of registry) {
    const elapsedSeconds = (now - value.created) / 1000;

    const isTimedOut = elapsedSeconds >= timeout;
    const isIdledOut = value.idle && elapsedSeconds >= timeoutIdle;

    if (isTimedOut || isIdledOut) {
      console.log('Stream has timed out: ' + key);
      writeToStream(value.stream, { type: 'timeout' });
      value.stream.end();
      registry.delete(key);
    }
  }
}

export function hasRegistrations() {
  return registry.size > 0;
}
