import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getOverview = async () => {
  const response = await axios.get(`${BASE_URL}/api/dashboard/overview`)
  return response.data
}