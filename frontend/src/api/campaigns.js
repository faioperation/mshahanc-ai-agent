// FILE: src/api/campaigns.js
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const createCampaign = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/campaigns/`, data)
  return response.data
}

export const getCampaigns = async () => {
  const response = await axios.get(`${BASE_URL}/api/campaigns/`)
  return response.data
}

export const getCampaignById = async (campaignId) => {
  const response = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}`)
  return response.data
}

export const launchCampaignNow = async (campaignId) => {
  const response = await axios.post(
    `${BASE_URL}/api/campaigns/${campaignId}/launch-now`
  )
  return response.data
}