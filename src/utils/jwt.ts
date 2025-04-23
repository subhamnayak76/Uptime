import jwt from 'jsonwebtoken'
const ACCESS_TOKEN_SECRET = ''
const REFRESH_TOKEN_SECRET = ''

export const generateAccessToken = (userId :string): string => {
    return jwt.sign({id : userId},ACCESS_TOKEN_SECRET,{expiresIn :'15m'})
}

export const generateRefreshToken = (userId : string): string=>{
    return jwt.sign({id :userId},REFRESH_TOKEN_SECRET,{expiresIn :'7d'})
}

export const verifyAccessToken = (token : string)=> {
     return jwt.verify(token,ACCESS_TOKEN_SECRET)
}

export const verifyRefreshToken = (token : string) => {
   return jwt.verify(token,REFRESH_TOKEN_SECRET)
}