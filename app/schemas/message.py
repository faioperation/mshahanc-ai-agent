from pydantic import BaseModel
from typing import Optional, List


class MessageResponse(BaseModel):
    id: str
    lead_id: Optional[str] = None
    lead_name: Optional[str] = None
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    sms_body: Optional[str] = None
    status: Optional[str] = None
    sequence_day: Optional[int] = None
    created_at: Optional[str] = None
    approved_at: Optional[str] = None


class MessageUpdateRequest(BaseModel):
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    sms_body: Optional[str] = None


class MessageApproveRequest(BaseModel):
    message_id: str


class MessageRejectRequest(BaseModel):
    message_id: str


class MessageListResponse(BaseModel):
    total: int
    messages: List[MessageResponse]