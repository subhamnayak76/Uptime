import { Request,Response } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
const createMonitor = async (req:Request,res: Response) =>{
    try {

        const {url,interval,notificationEmail} = req.body 
        const userId = req.userId as string;
        const monitor = await prisma.monitor.create({
            data: {
                url,
                interval,
                notificationEmail,
                userId,
            }
        })
        res.status(200).json(monitor)
    }catch (error) {
        console.log("error occured in the monitor ",error)
        res.status(500).json({message : "internal server error"})
    }
}

const getAllMonitors = async (req:Request,res:Response) =>{
    try{
        const userId = req.userId
        const monitors = await prisma.monitor.findMany({
            where :{ userId},
            include :{
                pingResults :{
                    orderBy : {
                        timestamp :'desc'
                    }
                }
            }
        })
        res.status(200).json(monitors)
    }
    catch(error){
        console.log("error fetching monitors",error)
        res.status(500).json({message:"internal server error"})

    }
    
}
const getMonitorById = async(req: Request,res:Response) => {
    try {
        const {id} = req.params
        const monitor = await prisma.monitor.findUnique({
            where : {
                id
            }
        })
        if(!monitor) {
             res.status(404).json({message : 'user not found'})
             return
        }
        res.status(200).json(monitor)
    }catch(error){
        console.log('error fetching monitor',error)
        res.status(500).json({message : 'internal server error'})
    }
}

const deleteMonitor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        const userId = req.userId as string; 
        const monitor = await prisma.monitor.findUnique({
            where: {
                id: id,
            },
        });

        if (!monitor || monitor.userId !== userId) {
             res.status(404).json({ message: 'Monitor not found or access denied' });
             return
        }
        await prisma.pingResult.deleteMany({
            where: { monitorId: id },
        });
        
        await prisma.monitor.delete({
            where: {
                id: id,
                
            },
        });

        res.status(204).send(); 

    } catch (error) {
        console.error('Error deleting monitor:', error);
        res.status(500).json({ message: 'Internal server error while deleting monitor' });
    }
};

export default {createMonitor,getAllMonitors,getMonitorById, deleteMonitor}
