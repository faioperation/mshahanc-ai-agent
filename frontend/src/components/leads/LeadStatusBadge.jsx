import Badge from '../ui/Badge'

const statusConfig = {
  raw: { label: 'Raw', variant: 'default' },
  qualified: { label: 'Qualified', variant: 'info' },
  disqualified: { label: 'Disqualified', variant: 'danger' },
  contacted: { label: 'Contacted', variant: 'indigo' },
  followed_up: { label: 'Followed Up', variant: 'purple' },
  replied: { label: 'Replied', variant: 'warning' },
  interested: { label: 'Interested', variant: 'success' },
  meeting_requested: { label: 'Meeting Requested', variant: 'warning' },
  booked: { label: 'Booked', variant: 'success' },
  closed_won: { label: 'Closed Won', variant: 'success' },
  closed_lost: { label: 'Closed Lost', variant: 'danger' },
}

export default function LeadStatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, variant: 'default' }
  return <Badge label={config.label} variant={config.variant} />
}