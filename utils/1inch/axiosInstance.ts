import axios, { AxiosError } from "axios";

const axios1Inch = axios.create({
  baseURL: process.env.REACT_APP_1INCH_PROXY_URL || "",
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_API_KEY_1INCH}`,
    accept: "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

axios1Inch.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 429) {
      if (!error.config) return;
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      return axios1Inch.request(error.config); 
    }
    return Promise.reject(error);
  }
);

export default axios1Inch;
