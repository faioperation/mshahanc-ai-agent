# FILE: app/schemas/campaign.py
from pydantic import BaseModel
from typing import Optional, List


class CampaignCreateRequest(BaseModel):
    event_name: str
    event_city: str
    start_at: str                       # ISO datetime — when the campaign should begin
    event_date: Optional[str] = None    # ISO date of the actual event
    event_description: Optional[str] = None


class CampaignResponse(BaseModel):
    id: str
    event_name: Optional[str] = None
    event_city: Optional[str] = None
    event_date: Optional[str] = None
    event_description: Optional[str] = None
    status: Optional[str] = None
    total_leads: Optional[int] = None
    processed_leads: Optional[int] = None
    start_at: Optional[str] = None
    started_at: Optional[str] = None
    created_at: Optional[str] = None


class CampaignListResponse(BaseModel):
    total: int
    campaigns: List[CampaignResponse]