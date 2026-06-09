# FILE: app/services/campaign_service.py  (REPLACE existing)
from typing import Any, Dict, List
import asyncio

from app.airtable.campaign_repo import (
    create_campaign,
    get_campaign_by_id,
    get_all_campaigns,
    get_due_scheduled_campaigns,
    update_campaign,
)
from app.airtable.lead_repo import get_all_leads
from app.models.campaign import Campaign, CampaignStatus
from app.constants.lead_status import LeadStatus
from app.services.sequence_service import start_sequence
from app.utils.date_utils import now_utc


def create_event_campaign(
    event_name: str,
    event_city: str,
    start_at: str,
    event_date: str = None,
    event_description: str = None,
    is_big_event: bool = False,
) -> Dict[str, Any]:
    """Create a scheduled campaign. The checker launches it when start_at arrives."""
    qualified = [l for l in get_all_leads() if l.get("status") == LeadStatus.QUALIFIED]

    campaign = Campaign(
        event_name=event_name,
        event_city=event_city,
        start_at=start_at,
        event_date=event_date,
        event_description=event_description,
        is_big_event=is_big_event,
        status=CampaignStatus.SCHEDULED,
        total_leads=len(qualified),
        processed_leads=0,
    )
    saved = create_campaign(campaign.to_airtable_dict())
    return saved


def list_campaigns() -> List[Dict[str, Any]]:
    return get_all_campaigns()


def get_campaign(campaign_id: str) -> Dict[str, Any]:
    return get_campaign_by_id(campaign_id)


def _build_event_context(campaign: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "event_name": campaign.get("event_name", ""),
        "event_city": campaign.get("event_city", ""),
        "event_date": campaign.get("event_date", ""),
        "event_description": campaign.get("event_description", ""),
        "is_big_event": campaign.get("is_big_event", False),
    }


async def launch_campaign(campaign_id: str) -> Dict[str, Any]:
    """Start an event-aware sequence for every qualified lead."""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        raise Exception(f"Campaign not found: {campaign_id}")

    if campaign.get("status") not in (CampaignStatus.SCHEDULED, CampaignStatus.RUNNING):
        return campaign

    update_campaign(campaign_id, {
        "status": CampaignStatus.RUNNING,
        "started_at": now_utc(),
    })

    event_context = _build_event_context(campaign)
    qualified = [l for l in get_all_leads() if l.get("status") == LeadStatus.QUALIFIED]

    processed = 0
    for lead in qualified:
        try:
            await start_sequence(
                lead["id"],
                event_context=event_context,
                campaign_id=campaign_id,
            )
            processed += 1
            if processed % 5 == 0:
                update_campaign(campaign_id, {"processed_leads": processed})
        except Exception as e:
            print(f"[Campaign {campaign_id}] lead {lead.get('id')} failed: {e}")
        await asyncio.sleep(0.2)

    finished = update_campaign(campaign_id, {
        "status": CampaignStatus.COMPLETED,
        "processed_leads": processed,
        "total_leads": len(qualified),
    })
    return finished


async def run_due_campaigns():
    """Called every minute by the scheduler; launches campaigns whose start_at passed."""
    try:
        due = get_due_scheduled_campaigns(now_utc())
    except Exception as e:
        print(f"[Campaign checker] could not query due campaigns: {e}")
        return

    for campaign in due:
        try:
            await launch_campaign(campaign["id"])
        except Exception as e:
            print(f"[Campaign checker] launch failed for {campaign.get('id')}: {e}")
            try:
                update_campaign(campaign["id"], {"status": CampaignStatus.FAILED})
            except Exception:
                pass