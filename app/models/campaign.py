# FILE: app/models/campaign.py  (REPLACE existing)
from dataclasses import dataclass
from typing import Optional


# Campaign status values (kept inline since it's a small, campaign-only set)
class CampaignStatus:
    SCHEDULED = "scheduled"   # created, waiting for start_at
    RUNNING = "running"       # checker picked it up, sequences being started
    COMPLETED = "completed"   # all leads processed
    CANCELLED = "cancelled"
    FAILED = "failed"


@dataclass
class Campaign:
    event_name: str
    event_city: str
    start_at: str                      # ISO datetime — when the campaign should begin
    event_date: Optional[str] = None   # ISO date of the actual event (for message context)
    event_description: Optional[str] = None
    is_big_event: bool = False         # user-set flag for a major event
    status: str = CampaignStatus.SCHEDULED
    total_leads: int = 0
    processed_leads: int = 0
    started_at: Optional[str] = None
    created_at: Optional[str] = None

    def to_airtable_dict(self) -> dict:
        data = {
            "event_name": self.event_name,
            "event_city": self.event_city,
            "start_at": self.start_at,
            "is_big_event": self.is_big_event,
            "status": self.status,
            "total_leads": self.total_leads,
            "processed_leads": self.processed_leads,
        }
        if self.event_date:
            data["event_date"] = self.event_date
        if self.event_description:
            data["event_description"] = self.event_description
        if self.started_at:
            data["started_at"] = self.started_at
        return data