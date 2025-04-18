import { createClient } from 'redis';

const redis = createClient();
(async () => {
  await redis.connect();
})();

export const publishStatusChange = async (monitorId: string, status: 'DOWN' | 'UP') => {
  await redis.publish('monitor-status', JSON.stringify({ monitorId, status }));
};