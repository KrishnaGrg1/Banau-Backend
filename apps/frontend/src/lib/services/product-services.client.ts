
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const bulkImportProducts = async ({ file }: { file: File }) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axiosInstance.post('/product/bulk', formData)
    return res.data.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to import products'
    )
  }
}


export const exportProducts = async (format: 'csv' | 'xlsx') => {
  try {
    const res = await axiosInstance.get('/product/export', {
      params: { format },
    })
    return res.data.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to export products'
    )
  }
}