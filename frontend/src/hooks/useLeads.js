import { useEffect } from 'react'
import useLeadStore from '../store/leadStore'

const useLeads = (status = null) => {
  const {
    leads,
    totalLeads,
    loading,
    error,
    fetchLeads,
    generateLeads,
    updateLead,
    clearError,
  } = useLeadStore()

  useEffect(() => {
    fetchLeads(status)
  }, [status])

  return {
    leads,
    totalLeads,
    loading,
    error,
    fetchLeads,
    generateLeads,
    updateLead,
    clearError,
  }
}

export default useLeads