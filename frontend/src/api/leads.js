import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const generateLeads = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/leads/generate`, data)
  return response.data
}

export const getLeads = async (status = null) => {
  const params = status ? { status } : {}
  const response = await axios.get(`${BASE_URL}/api/leads`, { params })
  return response.data
}

export const getLeadById = async (leadId) => {
  const response = await axios.get(`${BASE_URL}/api/leads/${leadId}`)
  return response.data
}

export const updateLead = async (leadId, data) => {
  const response = await axios.patch(`${BASE_URL}/api/leads/${leadId}`, data)
  return response.data
}