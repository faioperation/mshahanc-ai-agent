import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const getAllLogs = async () => {
  const response = await axios.get(`${BASE_URL}/api/outreach`)
  return response.data
}

export const getLogsByLead = async (leadId) => {
  const response = await axios.get(`${BASE_URL}/api/outreach/lead/${leadId}`)
  return response.data
}