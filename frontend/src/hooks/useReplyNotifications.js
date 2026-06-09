import { useEffect, useRef } from 'react'
import { getLeads } from '../api/leads'
import useNotificationStore from '../store/notificationStore'

const POLL_INTERVAL = 20000 // 20s

// Polls the backend for leads in the "replied" status and raises a
// notification whenever a lead becomes replied that we haven't seen before.
// On the first run we record the existing replied leads as a baseline so we
// don't fire notifications for replies that happened before the app loaded.
export default function useReplyNotifications() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const seenRef = useRef(null)

  useEffect(() => {
    let active = true
    let timer

    const poll = async () => {
      try {
        const data = await getLeads('replied')
        const leads = data.leads || []
        const currentIds = new Set(leads.map((l) => l.id))

        if (seenRef.current === null) {
          // baseline — don't notify for pre-existing replies
          seenRef.current = currentIds
        } else {
          leads.forEach((lead) => {
            if (!seenRef.current.has(lead.id)) {
              addNotification({
                type: 'reply',
                leadId: lead.id,
                leadName: lead.business_name || 'A lead',
                message: 'replied to your outreach',
              })
            }
          })
          seenRef.current = currentIds
        }
      } catch {
        // network hiccup — silently retry on the next tick
      } finally {
        if (active) timer = setTimeout(poll, POLL_INTERVAL)
      }
    }

    poll()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [addNotification])
}