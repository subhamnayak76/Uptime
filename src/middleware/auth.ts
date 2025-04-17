import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) { 
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid Authorization header format' });
  }


  const token = authHeader.split(' ')[1];  
  if(!token){
    return res.status(401).json({message: "unauthorized token not found"})
  }
  try {
    const payload = verifyAccessToken(token) as { id: string };
    req.userId = payload.id;
    next();
  } catch (err) {
     res.status(403).json({ message: 'Token expired or invalid' });
     
  }
};


