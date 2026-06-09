from pydantic import BaseModel
from typing import Optional, List


class ReplyWebhookRequest(BaseModel):
    lead_id: str
    channel: str
    reply_message: str


class ReplyResponse(BaseModel):
    id: str
    lead_id: Optional[str] = None
    lead_name: Optional[str] = None
    channel: Optional[str] = None
    reply_message: Optional[str] = None
    sentiment: Optional[str] = None
    is_positive: Optional[bool] = None
    requires_human_review: Optional[bool] = None
    created_at: Optional[str] = None


class ReplyListResponse(BaseModel):
    total: int
    replies: List[ReplyResponse]