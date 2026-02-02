import axiosInstance from "../axios"

export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/user/me', {
      withCredentials: true,
    })
    return response.data
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { body?: { message?: string }; message?: string } }
    }
    const errorMessage =
      err.response?.data?.body?.message ||
      err.response?.data?.message ||
      'Failed to fetch communities'
    throw new Error(errorMessage)
  }
}