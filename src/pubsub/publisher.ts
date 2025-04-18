import { createClient } from 'redis';

const redis = createClient();
(async () => {
  await redis.connect();
})();

export const publishStatusChange = async (monitorId: string, status: 'DOWN' | 'UP') => {
  console.log(`📢 Publishing status: ${status} for monitor ${monitorId}`); 
  await redis.publish('monitor-status', JSON.stringify({ monitorId, status }));
};