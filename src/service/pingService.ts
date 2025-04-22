
import axios from 'axios';

export const pingUrl = async (url: string): Promise<{
  isUp: boolean;
  statusCode?: number;
}> => {
  try {
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`${url} and the status is ${res.status}`)
    return {
      isUp: res.status >= 200 && res.status < 400,
      statusCode: res.status,
    };
  } catch (err:any){
    console.log(` Failed to ping ${url}:`, err.message);
    return {
      isUp: false,
    };
  }
};
