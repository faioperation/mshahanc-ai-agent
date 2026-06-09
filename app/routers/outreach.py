from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas.outreach_log import OutreachLogListResponse, OutreachLogResponse
from app.airtable.outreach_log_repo import get_all_logs, get_logs_by_lead

router = APIRouter(prefix="/api/outreach", tags=["Outreach Logs"])


@router.get("/", response_model=OutreachLogListResponse)
def get_all_outreach_logs():
    try:
        logs = get_all_logs()
        return OutreachLogListResponse(
            total=len(logs),
            logs=[OutreachLogResponse(**l) for l in logs],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}", response_model=OutreachLogListResponse)
def get_outreach_logs_for_lead(lead_id: str):
    try:
        logs = get_logs_by_lead(lead_id)
        return OutreachLogListResponse(
            total=len(logs),
            logs=[OutreachLogResponse(**l) for l in logs],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))