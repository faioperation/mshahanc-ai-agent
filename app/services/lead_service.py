from typing import Any, Dict, List, Tuple
from geopy.distance import geodesic

from app.services.apify_service import ApifyService
from app.utils.lead_utils import normalize_lead, qualify_lead
from app.airtable.lead_repo import create_lead, find_duplicate_lead
from app.models.lead import Lead
from app.constants.lead_status import LeadStatus


async def generate_and_save_leads(
    location: str,
    search_terms: List[str],
    reference_lat: float,
    reference_lng: float,
    radius_miles: float,
    max_results_per_search: int = 20,
    scrape_contacts: bool = True,
    max_leads_per_place: int = 1,
) -> Tuple[List[Dict], List[Dict]]:

    apify = ApifyService()
    raw_results = await apify.run_scraper(
        location=location,
        search_terms=search_terms,
        max_results_per_search=max_results_per_search,
        scrape_contacts=scrape_contacts,
        max_leads_per_place=max_leads_per_place,
    )

    ref_coords = (reference_lat, reference_lng)
    qualified_leads = []
    disqualified_leads = []

    for item in raw_results:
        normalized = normalize_lead(item)

        lat = normalized.get("lat")
        lng = normalized.get("lng")
        if lat and lng:
            distance = geodesic(ref_coords, (lat, lng)).miles
            if distance > radius_miles:
                continue

        duplicate = find_duplicate_lead(
            email=normalized.get("email"),
            phone=normalized.get("phone"),
        )
        if duplicate:
            continue

        qualification = qualify_lead(normalized)

        if qualification["qualified"]:
            lead = Lead(
                business_name=normalized["business_name"],
                phone=normalized.get("phone"),
                email=normalized.get("email"),
                website=normalized.get("website"),
                address=normalized.get("address"),
                category=normalized.get("category"),
                google_maps_url=normalized.get("google_maps_url"),
                source=normalized.get("source", "apify_google_places"),
                lat=normalized.get("lat"),
                lng=normalized.get("lng"),
                status=LeadStatus.QUALIFIED,
            )
            saved = create_lead(lead.to_airtable_dict())
            qualified_leads.append(saved)
        else:
            lead = Lead(
                business_name=normalized.get("business_name") or "Unknown",
                phone=normalized.get("phone"),
                email=normalized.get("email"),
                website=normalized.get("website"),
                address=normalized.get("address"),
                category=normalized.get("category"),
                google_maps_url=normalized.get("google_maps_url"),
                source=normalized.get("source", "apify_google_places"),
                lat=normalized.get("lat"),
                lng=normalized.get("lng"),
                status=LeadStatus.DISQUALIFIED,
                disqualified_reason=qualification["reason"],
            )
            saved = create_lead(lead.to_airtable_dict())
            disqualified_leads.append(saved)

    return qualified_leads, disqualified_leads