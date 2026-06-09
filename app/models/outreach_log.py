from dataclasses import dataclass
from typing import Optional


@dataclass
class OutreachLog:
    lead_id: str
    lead_name: str
    event_id: str
    channel: str
    message_content: str
    delivery_status: str
    sequence_day: int
    sent_at: Optional[str] = None

    def to_airtable_dict(self) -> dict:
        data = {
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "event_id": self.event_id,
            "channel": self.channel,
            "message_content": self.message_content,
            "delivery_status": self.delivery_status,
            "sequence_day": self.sequence_day,
        }
        if self.sent_at:
            data["sent_at"] = self.sent_at
        return data