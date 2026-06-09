// FILE: src/api/events.js
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const createEvent = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/events/`, data)
  return response.data
}

export const updateEvent = async (eventId, data) => {
  const response = await axios.patch(`${BASE_URL}/api/events/${eventId}`, data)
  return response.data
}

export const startSequence = async (leadId) => {
  const response = await axios.post(`${BASE_URL}/api/events/start-sequence/${leadId}`)
  return response.data
}

export const executeEvent = async (eventId) => {
  const response = await axios.post(`${BASE_URL}/api/events/execute/${eventId}`)
  return response.data
}

export const getAllEvents = async (status = null) => {
  const params = status ? { status } : {}
  const response = await axios.get(`${BASE_URL}/api/events/all`, { params })
  return response.data
}

export const getScheduledEvents = async () => {
  const response = await axios.get(`${BASE_URL}/api/events/scheduled`)
  return response.data
}

export const getEventsByLead = async (leadId) => {
  const response = await axios.get(`${BASE_URL}/api/events/lead/${leadId}`)
  return response.data
}

export const getEventById = async (eventId) => {
  const response = await axios.get(`${BASE_URL}/api/events/${eventId}`)
  return response.data
}

export const cancelEvents = async (leadId) => {
  const response = await axios.post(`${BASE_URL}/api/events/cancel/${leadId}`)
  return response.data
}