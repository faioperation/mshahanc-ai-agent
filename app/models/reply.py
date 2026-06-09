from dataclasses import dataclass
from typing import Optional

@dataclass
class Reply:
    lead_id: str
    lead_name: str
    channel: str
    reply_message: str
    sentiment: str = "neutral"
    is_positive: bool = False
    requires_human_review: bool = True
    created_at: Optional[str] = None

    def to_airtable_dict(self) -> dict:
        return {
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "channel": self.channel,
            "reply_message": self.reply_message,
            "sentiment": self.sentiment,
            "is_positive": self.is_positive,
            "requires_human_review": self.requires_human_review,
        }