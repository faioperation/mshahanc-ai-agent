# FILE: app/services/event_service.py  (REPLACE existing)
from typing import Any, Dict, Optional

from app.airtable.event_repo import (
    create_event, get_event_by_id,
    update_event, cancel_events_by_lead,
    get_events_by_lead,
)
from app.airtable.message_repo import get_message_by_id, update_message
from app.airtable.lead_repo import get_lead_by_id
from app.airtable.campaign_repo import get_campaign_by_id
from app.airtable.outreach_log_repo import create_log
from app.models.event import Event
from app.models.outreach_log import OutreachLog
from app.constants.event_status import EventStatus
from app.services.n8n_service import send_email_via_n8n, send_sms_via_n8n
from app.services.message_service import generate_message_for_lead
from app.utils.date_utils import now_utc


def _campaign_event_context(campaign_id: Optional[str]) -> Optional[Dict[str, Any]]:
    """Turn a campaign id into the context dict message_service understands."""
    if not campaign_id:
        return None
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return None
    return {
        "event_name": campaign.get("event_name", ""),
        "event_city": campaign.get("event_city", ""),
        "event_date": campaign.get("event_date", ""),
        "event_description": campaign.get("event_description", ""),
        "is_big_event": campaign.get("is_big_event", False),
    }


async def create_outreach_event(
    lead_id: str,
    message_id: str,
    channel: str,
    scheduled_at: str,
    sequence_day: int = 0,
    campaign_id: Optional[str] = None,
) -> Dict[str, Any]:

    lead = get_lead_by_id(lead_id)
    if not lead:
        raise Exception(f"Lead not found: {lead_id}")

    event = Event(
        lead_id=lead_id,
        lead_name=lead.get("business_name", ""),
        message_id=message_id,
        channel=channel,
        sequence_day=sequence_day,
        scheduled_at=scheduled_at,
        status=EventStatus.SCHEDULED,
        campaign_id=campaign_id,
    )

    saved = create_event(event.to_airtable_dict())
    return saved


async def create_event_for_lead(
    lead_id: str,
    channel: str,
    scheduled_at: str,
    message_id: Optional[str] = None,
    campaign_id: Optional[str] = None,
    sequence_day: int = 0,
) -> Dict[str, Any]:
    """
    Create-Event flow used by the UI.
    - If message_id is given, use it directly.
    - Otherwise generate a message for the lead. If a campaign is chosen,
      the message is generated with that event's context.
    """
    if not message_id:
        event_context = _campaign_event_context(campaign_id)
        message = await generate_message_for_lead(
            lead_id=lead_id,
            sequence_day=sequence_day,
            auto_send=False,
            event_context=event_context,
        )
        message_id = message["id"]

    return await create_outreach_event(
        lead_id=lead_id,
        message_id=message_id,
        channel=channel,
        scheduled_at=scheduled_at,
        sequence_day=sequence_day,
        campaign_id=campaign_id,
    )


async def update_event_details(
    event_id: str,
    channel: Optional[str] = None,
    scheduled_at: Optional[str] = None,
    email_subject: Optional[str] = None,
    email_body: Optional[str] = None,
    sms_body: Optional[str] = None,
) -> Dict[str, Any]:
    """Edit a scheduled event's time/channel and (via its linked message) content."""
    event = get_event_by_id(event_id)
    if not event:
        raise Exception(f"Event not found: {event_id}")

    # update the event record itself
    event_changes = {}
    if channel is not None:
        event_changes["channel"] = channel
    if scheduled_at is not None:
        event_changes["scheduled_at"] = scheduled_at
    if event_changes:
        update_event(event_id, event_changes)

    # update the linked message content, if any of those fields were sent
    message_changes = {}
    if email_subject is not None:
        message_changes["email_subject"] = email_subject
    if email_body is not None:
        message_changes["email_body"] = email_body
    if sms_body is not None:
        message_changes["sms_body"] = sms_body
    if message_changes and event.get("message_id"):
        update_message(event["message_id"], message_changes)

    return get_event_by_id(event_id)


async def execute_event(event_id: str) -> Dict[str, Any]:
    event = get_event_by_id(event_id)
    if not event:
        raise Exception(f"Event not found: {event_id}")

    if event.get("status") != EventStatus.SCHEDULED:
        return event

    lead = get_lead_by_id(event["lead_id"])
    message = get_message_by_id(event["message_id"])

    if not lead or not message:
        update_event(event_id, {"status": EventStatus.FAILED})
        raise Exception("Lead or message not found for event execution")

    channel = event.get("channel")

    try:
        if channel == "email":
            await send_email_via_n8n(
                to_email=lead.get("email"),
                subject=message.get("email_subject", ""),
                body=message.get("email_body", ""),
                lead_id=event["lead_id"],
                event_id=event_id,
            )
            message_content = message.get("email_body", "")

        elif channel == "sms":
            await send_sms_via_n8n(
                to_phone=lead.get("phone"),
                body=message.get("sms_body", ""),
                lead_id=event["lead_id"],
                event_id=event_id,
            )
            message_content = message.get("sms_body", "")

        elif channel == "both":
            await send_email_via_n8n(
                to_email=lead.get("email"),
                subject=message.get("email_subject", ""),
                body=message.get("email_body", ""),
                lead_id=event["lead_id"],
                event_id=event_id,
            )
            await send_sms_via_n8n(
                to_phone=lead.get("phone"),
                body=message.get("sms_body", ""),
                lead_id=event["lead_id"],
                event_id=event_id,
            )
            message_content = message.get("email_body", "")

        else:
            raise Exception(f"Unknown channel: {channel}")

        sent_at = now_utc()
        updated_event = update_event(event_id, {
            "status": EventStatus.SENT,
            "sent_at": sent_at,
        })

        log = OutreachLog(
            lead_id=event["lead_id"],
            lead_name=event.get("lead_name", ""),
            event_id=event_id,
            channel=channel,
            message_content=message_content,
            delivery_status="sent",
            sequence_day=event.get("sequence_day", 0),
            sent_at=sent_at,
        )
        create_log(log.to_airtable_dict())

        return updated_event

    except Exception as e:
        update_event(event_id, {"status": EventStatus.FAILED})
        raise e


async def cancel_lead_events(lead_id: str):
    cancel_events_by_lead(lead_id)