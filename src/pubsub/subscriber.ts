import { createClient } from "redis";
import { Prisma, PrismaClient } from "@prisma/client";
import { sendDownAlert } from "../service/emailService";
const prisma = new PrismaClient()

const redis = createClient();
(async () => {
    await redis.connect();
  })();
  
export const subscribetoEmailEvents = async () => {
    await redis.subscribe('monitor-status',async(message) => {
        try {
            const {monitorId ,status} = JSON.parse(message)

            if(status !== 'DOWN') return
            const monitor = await prisma.monitor.findUnique({
                where : {id : monitorId},
                include : {user : true}
            })
            if(!monitor || !monitor.user) return
            await sendDownAlert(monitor.user.email,monitor.url)
            console.log(`alert sent to ${monitor.user.email} for ${monitor.url}`)

        }catch (e) {
            console.log('error in subcribere',e)
        }
    })
    console.log('Redis subscriber is listening on monitor status')
}
