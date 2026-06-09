from pydantic import BaseModel
from typing import Optional, List


class LeadGenerateRequest(BaseModel):
    search_terms: List[str] = [
        "law office",
        "law firm",
        "legal services",
        "attorney",
        "school",
        "university",
        "production studio",
        "insurance office",
        "corporate office",
        "private school",
        "gym",
        "education center",
        "medical office",
        "insurance office",
        "accounting office",
        "real estate office",
        "marketing agency",
        "advertising agency",
        "consulting firm",
        "architectural firm",
        "engineering firm",
        "financial services",
        "it services",
        "auto repair",
    ]
    location: str
    radius_miles: float = 10.0
    reference_lat: float
    reference_lng: float
    max_results_per_search: int = 20
    scrape_contacts: bool = True
    max_leads_per_place: int = 1


class LeadResponse(BaseModel):
    id: str
    business_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    google_maps_url: Optional[str] = None
    source: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: Optional[str] = None
    disqualified_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None


class LeadUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class LeadListResponse(BaseModel):
    total: int
    leads: List[LeadResponse]


class LeadGenerateResponse(BaseModel):
    total_raw: int
    total_qualified: int
    total_disqualified: int
    qualified_leads: List[LeadResponse]
    disqualified_leads: List[LeadResponse]