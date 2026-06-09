from fastapi import APIRouter, HTTPException
from app.airtable.lead_repo import get_all_leads
from app.airtable.outreach_log_repo import get_all_logs
from app.airtable.reply_repo import get_replies_by_lead
from app.airtable.event_repo import get_scheduled_events
from app.airtable.message_repo import get_pending_review_messages
from app.constants.lead_status import LeadStatus

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def get_overview():
    try:
        all_leads = get_all_leads()
        all_logs = get_all_logs()
        pending_messages = get_pending_review_messages()
        scheduled_events = get_scheduled_events()

        total_leads = len(all_leads)
        qualified = len([l for l in all_leads if l.get("status") == LeadStatus.QUALIFIED])
        disqualified = len([l for l in all_leads if l.get("status") == LeadStatus.DISQUALIFIED])
        contacted = len([l for l in all_leads if l.get("status") == LeadStatus.CONTACTED])
        replied = len([l for l in all_leads if l.get("status") == LeadStatus.REPLIED])
        interested = len([l for l in all_leads if l.get("status") == LeadStatus.INTERESTED])
        booked = len([l for l in all_leads if l.get("status") == LeadStatus.BOOKED])
        closed_won = len([l for l in all_leads if l.get("status") == LeadStatus.CLOSED_WON])
        closed_lost = len([l for l in all_leads if l.get("status") == LeadStatus.CLOSED_LOST])

        total_messages_sent = len(all_logs)
        email_sent = len([l for l in all_logs if l.get("channel") == "email"])
        sms_sent = len([l for l in all_logs if l.get("channel") == "sms"])
        both_sent = len([l for l in all_logs if l.get("channel") == "both"])

        return {
            "leads": {
                "total": total_leads,
                "qualified": qualified,
                "disqualified": disqualified,
                "contacted": contacted,
                "replied": replied,
                "interested": interested,
                "booked": booked,
                "closed_won": closed_won,
                "closed_lost": closed_lost,
            },
            "outreach": {
                "total_messages_sent": total_messages_sent,
                "email_sent": email_sent,
                "sms_sent": sms_sent,
                "both_sent": both_sent,
            },
            "pending": {
                "messages_pending_review": len(pending_messages),
                "scheduled_events": len(scheduled_events),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))