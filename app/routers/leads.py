from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional

from app.schemas.lead import (
    LeadGenerateRequest,
    LeadGenerateResponse,
    LeadListResponse,
    LeadResponse,
    LeadUpdateRequest,
)
from app.services.lead_service import generate_and_save_leads
from app.airtable.lead_repo import get_all_leads, get_lead_by_id, update_lead

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.post("/generate", response_model=LeadGenerateResponse)
async def generate_leads(request: LeadGenerateRequest, background_tasks: BackgroundTasks):
    try:
        qualified, disqualified = await generate_and_save_leads(
            location=request.location,
            search_terms=request.search_terms,
            reference_lat=request.reference_lat,
            reference_lng=request.reference_lng,
            radius_miles=request.radius_miles,
            max_results_per_search=request.max_results_per_search,
            scrape_contacts=request.scrape_contacts,
            max_leads_per_place=request.max_leads_per_place,
        )
        return LeadGenerateResponse(
            total_raw=len(qualified) + len(disqualified),
            total_qualified=len(qualified),
            total_disqualified=len(disqualified),
            qualified_leads=[LeadResponse(**l) for l in qualified],
            disqualified_leads=[LeadResponse(**l) for l in disqualified],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=LeadListResponse)
def list_leads(status: Optional[str] = None):
    try:
        leads = get_all_leads(status=status)
        return LeadListResponse(
            total=len(leads),
            leads=[LeadResponse(**l) for l in leads],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse(**lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead_endpoint(lead_id: str, request: LeadUpdateRequest):
    try:
        data = request.model_dump(exclude_none=True)
        updated = update_lead(lead_id, data)
        return LeadResponse(**updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))