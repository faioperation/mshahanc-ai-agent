import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const generateMessage = async (leadId, sequenceDay = 0) => {
  const response = await axios.post(
    `${BASE_URL}/api/messages/generate/${leadId}`,
    null,
    { params: { sequence_day: sequenceDay } }
  )
  return response.data
}

export const getReviewQueue = async () => {
  const response = await axios.get(`${BASE_URL}/api/messages/review-queue`)
  return response.data
}

export const getMessagesByLead = async (leadId) => {
  const response = await axios.get(`${BASE_URL}/api/messages/lead/${leadId}`)
  return response.data
}

export const getMessageById = async (messageId) => {
  const response = await axios.get(`${BASE_URL}/api/messages/${messageId}`)
  return response.data
}

export const updateMessage = async (messageId, data) => {
  const response = await axios.patch(`${BASE_URL}/api/messages/${messageId}`, data)
  return response.data
}

export const approveMessage = async (messageId) => {
  const response = await axios.post(`${BASE_URL}/api/messages/approve`, {
    message_id: messageId,
  })
  return response.data
}

export const rejectMessage = async (messageId) => {
  const response = await axios.post(`${BASE_URL}/api/messages/reject`, {
    message_id: messageId,
  })
  return response.data
}