import { useEffect } from 'react'
import useMessageStore from '../store/messageStore'

const useMessages = (leadId = null) => {
  const {
    reviewQueue,
    leadMessages,
    totalPending,
    loading,
    error,
    fetchReviewQueue,
    fetchMessagesByLead,
    generateMessage,
    approveMessage,
    rejectMessage,
    updateMessage,
    clearError,
  } = useMessageStore()

  useEffect(() => {
    if (leadId) {
      fetchMessagesByLead(leadId)
    } else {
      fetchReviewQueue()
    }
  }, [leadId])

  return {
    reviewQueue,
    leadMessages,
    totalPending,
    loading,
    error,
    fetchReviewQueue,
    fetchMessagesByLead,
    generateMessage,
    approveMessage,
    rejectMessage,
    updateMessage,
    clearError,
  }
}

export default useMessages