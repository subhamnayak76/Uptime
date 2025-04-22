import { PrismaClient } from "@prisma/client";
import { pingUrl } from "./pingService";
import { publishStatusChange } from "../pubsub/publisher";

import cron from 'node-cron'
const prisma = new PrismaClient()

const runWatcher = async () =>{
    const now = new Date()
    const monitors = await prisma.monitor.findMany()

    for (const monitor of monitors) {
        try{
        const lastPinged =monitor.lastPingedAt ?? new Date(0)
        const nextPingtime = new Date(lastPinged.getTime() + monitor.interval * 1000)
        if( now < nextPingtime) continue
        const {isUp,statusCode,} = await pingUrl(monitor.url)
        const lastResult = await prisma.pingResult.findFirst({
            where : {monitorId : monitor.id},
            orderBy : {timestamp:'desc'}
        })
        console.log(lastResult)
        await prisma.pingResult.create({
            data : {
                monitorId : monitor.id,
                isUp,
                statusCode: statusCode ?? 0
            }
        })

        await prisma.monitor.update({
            where: { id: monitor.id },
            data: { lastPingedAt: now },
          });
          
        if (!lastResult) {
    
        await publishStatusChange(monitor.id, isUp ? 'UP' : 'DOWN');
        console.log(`Initial status for ${monitor.url}: ${isUp ? 'UP' : 'DOWN'}`);
        } else if (lastResult.isUp !== isUp) {
    
        await publishStatusChange(monitor.id, isUp ? 'UP' : 'DOWN');
        console.log(`Status changed for ${monitor.url}: ${isUp ? 'UP' : 'DOWN'}`);
  }
        } catch(e) {
            console.log('some error occured',e)

        }
    }
}


cron.schedule('* * * * * *', async () => {
    console.log('Running watcher...');
    await runWatcher();
  });


