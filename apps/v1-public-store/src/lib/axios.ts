import axios, { type AxiosInstance, } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})
export default axiosInstance