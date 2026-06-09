from dataclasses import dataclass
from typing import Optional
from app.constants.message_status import MessageStatus


@dataclass
class Message:
    lead_id: str
    lead_name: str
    sequence_day: int
    status: str = MessageStatus.PENDING_REVIEW
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    sms_body: Optional[str] = None
    created_at: Optional[str] = None
    approved_at: Optional[str] = None

    def to_airtable_dict(self) -> dict:
        data = {
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "sequence_day": self.sequence_day,
            "status": self.status,
        }
        if self.email_subject:
            data["email_subject"] = self.email_subject
        if self.email_body:
            data["email_body"] = self.email_body
        if self.sms_body:
            data["sms_body"] = self.sms_body
        if self.approved_at:
            data["approved_at"] = self.approved_at
        return data