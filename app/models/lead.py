from dataclasses import dataclass, field
from typing import Optional
from app.constants.lead_status import LeadStatus


@dataclass
class Lead:
    business_name: str
    status: str = LeadStatus.RAW
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    google_maps_url: Optional[str] = None
    source: str = "apify_google_places"
    lat: Optional[float] = None
    lng: Optional[float] = None
    disqualified_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None

    def to_airtable_dict(self) -> dict:
        data = {
            "business_name": self.business_name,
            "status": self.status,
            "source": self.source,
        }
        if self.phone:
            data["phone"] = self.phone
        if self.email:
            data["email"] = self.email
        if self.website:
            data["website"] = self.website
        if self.address:
            data["address"] = self.address
        if self.category:
            data["category"] = self.category
        if self.google_maps_url:
            data["google_maps_url"] = self.google_maps_url
        if self.lat is not None:
            data["lat"] = self.lat
        if self.lng is not None:
            data["lng"] = self.lng
        if self.disqualified_reason:
            data["disqualified_reason"] = self.disqualified_reason
        if self.notes:
            data["notes"] = self.notes
        return data