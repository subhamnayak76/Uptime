import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import apiRoutes from './routes/apiRoutes'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true 
}));
app.use(express.json()); 
app.use(cookieParser()); 


app.use('/api', apiRoutes); 


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
