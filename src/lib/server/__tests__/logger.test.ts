import test from 'node:test';
import assert from 'node:assert/strict';
import { log } from '@/lib/server/logger';

function captureConsole(method: 'error' | 'warn' | 'log', fn: () => void): string[] {
  const messages: string[] = [];
  const original = console[method];
  console[method] = (msg: string) => {
    messages.push(msg);
  };
  try {
    fn();
  } finally {
    console[method] = original;
  }
  return messages;
}

test('log routes error level to console.error', () => {
  const messages = captureConsole('error', () => {
    log('error', 'something exploded');
  });
  assert.equal(messages.length, 1);
  const entry = JSON.parse(messages[0]) as { level: string; message: string };
  assert.equal(entry.level, 'error');
  assert.equal(entry.message, 'something exploded');
});

test('log routes warn level to console.warn', () => {
  const messages = captureConsole('warn', () => {
    log('warn', 'heads up');
  });
  assert.equal(messages.length, 1);
  const entry = JSON.parse(messages[0]) as { level: string; message: string };
  assert.equal(entry.level, 'warn');
  assert.equal(entry.message, 'heads up');
});

test('log routes info level to console.log', () => {
  const messages = captureConsole('log', () => {
    log('info', 'all good');
  });
  assert.equal(messages.length, 1);
  const entry = JSON.parse(messages[0]) as { level: string; message: string };
  assert.equal(entry.level, 'info');
  assert.equal(entry.message, 'all good');
});

test('log routes debug level to console.log', () => {
  const messages = captureConsole('log', () => {
    log('debug', 'verbose output');
  });
  assert.equal(messages.length, 1);
  const entry = JSON.parse(messages[0]) as { level: string; message: string };
  assert.equal(entry.level, 'debug');
  assert.equal(entry.message, 'verbose output');
});

test('log entry includes a timestamp', () => {
  const messages = captureConsole('log', () => {
    log('info', 'timestamped');
  });
  const entry = JSON.parse(messages[0]) as { timestamp: string };
  assert.ok(typeof entry.timestamp === 'string');
  assert.ok(!isNaN(Date.parse(entry.timestamp)));
});

test('log serializes context when provided', () => {
  const messages = captureConsole('warn', () => {
    log('warn', 'with context', { userId: 'u1', attempt: 3 });
  });
  const entry = JSON.parse(messages[0]) as { context: { userId: string; attempt: number } };
  assert.deepEqual(entry.context, { userId: 'u1', attempt: 3 });
});

test('log omits context key when context is not provided', () => {
  const messages = captureConsole('log', () => {
    log('info', 'no context');
  });
  const entry = JSON.parse(messages[0]) as Record<string, unknown>;
  assert.equal('context' in entry, false);
});

test('log does not route error to console.warn or console.log', () => {
  const warnMessages: string[] = [];
  const logMessages: string[] = [];
  const originalWarn = console.warn;
  const originalLog = console.log;
  console.warn = (msg: string) => { warnMessages.push(msg); };
  console.log = (msg: string) => { logMessages.push(msg); };

  try {
    const errorMessages = captureConsole('error', () => {
      log('error', 'only in error');
    });
    assert.equal(errorMessages.length, 1);
    assert.equal(warnMessages.length, 0);
    assert.equal(logMessages.length, 0);
  } finally {
    console.warn = originalWarn;
    console.log = originalLog;
  }
});
