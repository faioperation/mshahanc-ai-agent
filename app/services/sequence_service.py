# FILE: app/services/sequence_service.py  (REPLACE existing)
from typing import Any, Dict, Optional
from datetime import datetime, timezone, timedelta

from app.airtable.lead_repo import get_lead_by_id, update_lead
from app.airtable.reply_repo import has_replied
from app.airtable.settings_repo import get_setting
from app.services.message_service import generate_message_for_lead
from app.services.event_service import create_outreach_event, execute_event, cancel_lead_events
from app.constants.lead_status import LeadStatus
from app.utils.date_utils import get_sequence_dates, now_utc
from app.scheduler import scheduler


async def start_sequence(
    lead_id: str,
    event_context: Optional[Dict[str, Any]] = None,
    campaign_id: Optional[str] = None,
) -> Dict[str, Any]:
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise Exception(f"Lead not found: {lead_id}")

    auto_send_setting = get_setting("auto_send")
    auto_send = auto_send_setting == "true" if auto_send_setting else False

    start_date = datetime.now(timezone.utc) + timedelta(minutes=2)
    sequence_dates = get_sequence_dates(start_date)

    for item in sequence_dates:
        sequence_day = item["sequence_day"]
        scheduled_at = item["scheduled_at"]

        message = await generate_message_for_lead(
            lead_id=lead_id,
            sequence_day=sequence_day,
            auto_send=auto_send,
            event_context=event_context,
        )

        # Create the scheduled Event when auto_send is ON (it will fire on time),
        # OR whenever this sequence belongs to a campaign — so the campaign's
        # events are always visible/manageable on the Events page even when
        # auto-send is off (the user sends/cancels them manually).
        if auto_send or campaign_id:
            event = await create_outreach_event(
                lead_id=lead_id,
                message_id=message["id"],
                channel="both",
                scheduled_at=scheduled_at,
                sequence_day=sequence_day,
                campaign_id=campaign_id,
            )

            if auto_send:
                scheduler.add_job(
                    func=run_scheduled_event,
                    trigger="date",
                    run_date=scheduled_at,
                    args=[event["id"], lead_id],
                    id=f"event_{event['id']}",
                    replace_existing=True,
                )

    update_lead(lead_id, {"status": LeadStatus.CONTACTED})

    return {"message": "Sequence started", "lead_id": lead_id}


async def run_scheduled_event(event_id: str, lead_id: str):
    if has_replied(lead_id):
        return

    await execute_event(event_id)


async def cancel_sequence(lead_id: str):
    await cancel_lead_events(lead_id)

    all_jobs = scheduler.get_jobs()
    for job in all_jobs:
        if lead_id in str(job.args):
            scheduler.remove_job(job.id)