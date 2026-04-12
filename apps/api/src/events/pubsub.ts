import { redisSub } from '../lib/redis';

type EventHandler = (data: unknown) => void;
const handlers = new Map<string, Set<EventHandler>>();

export function subscribe(channel: string, handler: EventHandler) {
  if (!handlers.has(channel)) {
    handlers.set(channel, new Set());
    redisSub.subscribe(channel);
  }
  handlers.get(channel)!.add(handler);
}

export function unsubscribe(channel: string, handler: EventHandler) {
  handlers.get(channel)?.delete(handler);
}

redisSub.on('message', (channel, message) => {
  try {
    const data = JSON.parse(message);
    handlers.get(channel)?.forEach((h) => h(data));
  } catch {
    // malformed message — ignore
  }
});
