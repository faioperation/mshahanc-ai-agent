from pydantic import BaseModel
from typing import Optional, List


class OutreachLogResponse(BaseModel):
    id: str
    lead_id: Optional[str] = None
    lead_name: Optional[str] = None
    event_id: Optional[str] = None
    channel: Optional[str] = None
    message_content: Optional[str] = None
    delivery_status: Optional[str] = None
    sequence_day: Optional[int] = None
    sent_at: Optional[str] = None


class OutreachLogListResponse(BaseModel):
    total: int
    logs: List[OutreachLogResponse]