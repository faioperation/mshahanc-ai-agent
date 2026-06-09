import { RefreshCw } from 'lucide-react'
import ReviewQueue from '../components/messages/ReviewQueue'
import Button from '../components/ui/Button'
import useMessages from '../hooks/useMessages'

export default function Messages() {
  const {
    reviewQueue,
    totalPending,
    loading,
    fetchReviewQueue,
    approveMessage,
    rejectMessage,
    updateMessage,
  } = useMessages()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Message Review Queue</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalPending} messages pending review
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={fetchReviewQueue}
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <ReviewQueue
        messages={reviewQueue}
        loading={loading}
        onApprove={approveMessage}
        onReject={rejectMessage}
        onUpdate={updateMessage}
      />
    </div>
  )
}