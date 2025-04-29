// auth-service/utils/redis.js
import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));

// Promisify methods
export default {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  del: promisify(client.del).bind(client),
  setEx: promisify(client.setEx).bind(client),
  quit: promisify(client.quit).bind(client),
  client // raw client for special cases
};