from dataclasses import dataclass
from typing import Optional
from app.constants.event_status import EventStatus

@dataclass
class Event:
    lead_id: str
    lead_name: str
    message_id: str
    channel: str
    sequence_day: int
    scheduled_at: str
    status: str = EventStatus.SCHEDULED
    sent_at: Optional[str] = None

    def to_airtable_dict(self) -> dict:
        data = {
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "message_id": self.message_id,
            "channel": self.channel,
            "sequence_day": self.sequence_day,
            "scheduled_at": self.scheduled_at,
            "status": self.status,
        }
        if self.sent_at:
            data["sent_at"] = self.sent_at
        return data