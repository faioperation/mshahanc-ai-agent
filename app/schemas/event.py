# FILE: app/schemas/event.py  (REPLACE existing)
from pydantic import BaseModel
from typing import Optional, List


class EventCreateRequest(BaseModel):
    lead_id: str
    channel: str
    scheduled_at: str
    # message_id is now optional: if a campaign is chosen (or omitted), the
    # backend generates a message instead of requiring an existing one.
    message_id: Optional[str] = None
    campaign_id: Optional[str] = None


class EventUpdateRequest(BaseModel):
    # Editable fields from the Events page
    channel: Optional[str] = None
    scheduled_at: Optional[str] = None
    # message content edits (applied to the linked message)
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    sms_body: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    lead_id: Optional[str] = None
    lead_name: Optional[str] = None
    message_id: Optional[str] = None
    campaign_id: Optional[str] = None
    channel: Optional[str] = None
    sequence_day: Optional[int] = None
    status: Optional[str] = None
    scheduled_at: Optional[str] = None
    sent_at: Optional[str] = None


class EventCancelRequest(BaseModel):
    event_id: str


class EventListResponse(BaseModel):
    total: int
    events: List[EventResponse]