# FILE: app/routers/events.py
from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas.event import (
    EventCreateRequest,
    EventUpdateRequest,
    EventResponse,
    EventListResponse,
)
from app.services.event_service import (
    create_event_for_lead,
    execute_event,
    cancel_lead_events,
    update_event_details,
)
from app.services.sequence_service import start_sequence
from app.airtable.event_repo import (
    get_event_by_id,
    get_events_by_lead,
    get_scheduled_events,
    get_all_events,
)

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.post("/", response_model=EventResponse)
async def create_event(request: EventCreateRequest):
    try:
        event = await create_event_for_lead(
            lead_id=request.lead_id,
            channel=request.channel,
            scheduled_at=request.scheduled_at,
            message_id=request.message_id,
            campaign_id=request.campaign_id,
        )
        return EventResponse(**event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start-sequence/{lead_id}")
async def start_sequence_endpoint(lead_id: str):
    try:
        result = await start_sequence(lead_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute/{event_id}", response_model=EventResponse)
async def execute_event_endpoint(event_id: str):
    try:
        event = await execute_event(event_id)
        return EventResponse(**event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event_endpoint(event_id: str, request: EventUpdateRequest):
    try:
        updated = await update_event_details(
            event_id=event_id,
            channel=request.channel,
            scheduled_at=request.scheduled_at,
            email_subject=request.email_subject,
            email_body=request.email_body,
            sms_body=request.sms_body,
        )
        return EventResponse(**updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all", response_model=EventListResponse)
def get_all_events_endpoint(status: Optional[str] = None):
    """Return all events, optionally filtered by status."""
    try:
        events = get_all_events(status=status)
        return EventListResponse(total=len(events), events=[EventResponse(**e) for e in events])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scheduled", response_model=EventListResponse)
def get_scheduled():
    try:
        events = get_scheduled_events()
        return EventListResponse(
            total=len(events),
            events=[EventResponse(**e) for e in events],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}", response_model=EventListResponse)
def get_events_for_lead(lead_id: str):
    try:
        events = get_events_by_lead(lead_id)
        return EventListResponse(
            total=len(events),
            events=[EventResponse(**e) for e in events],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str):
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse(**event)


@router.post("/cancel/{lead_id}")
async def cancel_events(lead_id: str):
    try:
        await cancel_lead_events(lead_id)
        return {"message": "Events cancelled", "lead_id": lead_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))