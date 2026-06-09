import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const getSettings = async () => {
  const response = await axios.get(`${BASE_URL}/api/settings`)
  return response.data
}

export const updateSettings = async (data) => {
  const response = await axios.patch(`${BASE_URL}/api/settings`, data)
  return response.data
}