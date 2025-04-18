import { Request,Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import { generateRefreshToken,generateAccessToken,verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import bcrypt from 'bcrypt'


const salt_Round = 10

const registerUser = async (req: Request,res:Response ):Promise<any> =>{
    try{
        const {email,password,name} = req.body

        const existinguser = await prisma.user.findUnique({
            where : {
                email
            }
        })
        if(existinguser) {
            return res.status(400).json({message : 'user already exit'})
        }
        const hashedpass = await bcrypt.hash(password,salt_Round)

        const user = await prisma.user.create({
            data : {
                email,
                password: hashedpass,
                name,
                
                
            },
        })
         res.status(201).json(user)
         
    } catch (error){
        console.log('error creating user ',error)
        res.status(500).json({message:'internal server error'})
    }
    
}

const login = async (req:Request,res:Response) =>{
    try{
    const {email ,password} = req.body 
    const user = await prisma.user.findUnique({
        where : {
            email
        }
    })
    console.log(user)
    if(!user || !(await bcrypt.compare(password,user.password))){
        res.status(401).json({message : "invalid credentials"})
        return
    }
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id) 
    const updatedUser = await prisma.user.update({
        where: { 
            id: user.id 
        },
        data: { 
            refreshToken 
        }
    })
    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        sameSite : 'strict',
        maxAge : 7 * 24 * 60 * 60 * 1000,
    })
   res.json({accessToken})


}catch(error){
  console.log('error while login ')
  res.status(403).json({message : 'token expired or invalid'})
}

}

const getUser = async(req: Request,res:Response):Promise<any> =>{
    try {
        const {id} = req.params
        const user = await prisma.user.findUnique({
            where : {id},
            include : {monitors : true}
        })
        if(!user){
            return res.status(404).json({message: 'user not found'})
        }
        res.status(200).json({data : user})
        
    }catch(error){
        console.log('error fetching user:',error)
        res.status(500).json({message:"internal server error"})
    }
}

const refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
  
    try {
      const payload = verifyRefreshToken(token) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
  
      if (!user || user.refreshToken !== token)
        return res.status(403).json({ message: 'Invalid refresh token' });
  
      const newAccessToken = generateAccessToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);
  
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });
  
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(403).json({ message: 'Token expired or invalid' });
    }
  };
const logout = async (req:Request,res:Response)=>{
    const token = req.cookies.refreshToken
    if(!token) return res.sendStatus(204)
    try{
        const payload = verifyAccessToken(token) as {id : string}
        await prisma.user.update({
            where : {id: payload.id},
            data : {
                refreshToken:null
            }
        })
        res.clearCookie('refreshToken')
        res.sendStatus(204)
        
 }catch{
    res.clearCookie('refreshToken');
    res.sendStatus(204);
 }
}



export default {
    registerUser,getUser,login,refresh,logout
}