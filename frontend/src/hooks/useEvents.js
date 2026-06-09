import { useEffect } from 'react'
import useEventStore from '../store/eventStore'

const useEvents = (leadId = null) => {
  const {
    events,
    leadEvents,
    totalEvents,
    loading,
    error,
    fetchScheduledEvents,
    fetchEventsByLead,
    startSequence,
    cancelEvents,
    executeEvent,
    clearError,
  } = useEventStore()

  useEffect(() => {
    if (leadId) {
      fetchEventsByLead(leadId)
    } else {
      fetchScheduledEvents()
    }
  }, [leadId])

  return {
    events,
    leadEvents,
    totalEvents,
    loading,
    error,
    fetchScheduledEvents,
    fetchEventsByLead,
    startSequence,
    cancelEvents,
    executeEvent,
    clearError,
  }
}

export default useEvents