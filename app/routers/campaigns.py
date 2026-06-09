# FILE: app/routers/campaigns.py
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.schemas.campaign import (
    CampaignCreateRequest,
    CampaignResponse,
    CampaignListResponse,
)
from app.services.campaign_service import (
    create_event_campaign,
    list_campaigns,
    get_campaign,
    launch_campaign,
)

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])


@router.post("/", response_model=CampaignResponse)
def create_campaign_endpoint(request: CampaignCreateRequest):
    try:
        campaign = create_event_campaign(
            event_name=request.event_name,
            event_city=request.event_city,
            start_at=request.start_at,
            event_date=request.event_date,
            event_description=request.event_description,
            is_big_event=request.is_big_event,
        )
        return CampaignResponse(**campaign)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=CampaignListResponse)
def list_campaigns_endpoint():
    try:
        campaigns = list_campaigns()
        return CampaignListResponse(
            total=len(campaigns),
            campaigns=[CampaignResponse(**c) for c in campaigns],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign_endpoint(campaign_id: str):
    campaign = get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return CampaignResponse(**campaign)


# Optional: trigger a scheduled campaign immediately, without waiting for start_at.
# Runs in the background so the request returns right away.
@router.post("/{campaign_id}/launch-now")
async def launch_now_endpoint(campaign_id: str, background_tasks: BackgroundTasks):
    campaign = get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    background_tasks.add_task(launch_campaign, campaign_id)
    return {"message": "Campaign launch started", "campaign_id": campaign_id}