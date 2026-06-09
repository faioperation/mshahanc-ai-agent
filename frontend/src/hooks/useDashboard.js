import { useState, useEffect } from 'react'
import { getOverview } from '../api/dashboard'

const useDashboard = () => {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOverview()
      setOverview(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  return {
    overview,
    loading,
    error,
    fetchOverview,
  }
}

export default useDashboard