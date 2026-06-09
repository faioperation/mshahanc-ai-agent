from fastapi import APIRouter, HTTPException
from app.schemas.settings import SettingsUpdateRequest, SettingsResponse
from app.services.settings_service import get_settings, update_settings

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("/", response_model=SettingsResponse)
def get_settings_endpoint():
    try:
        return get_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/", response_model=SettingsResponse)
def update_settings_endpoint(request: SettingsUpdateRequest):
    try:
        return update_settings(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))