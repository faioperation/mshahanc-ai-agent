from pydantic import BaseModel
from typing import Optional


class SettingsUpdateRequest(BaseModel):
    restaurant_name: Optional[str] = None
    restaurant_address: Optional[str] = None
    restaurant_lat: Optional[float] = None
    restaurant_lng: Optional[float] = None
    default_radius_miles: Optional[float] = None
    auto_send: Optional[bool] = None
    contact_name: Optional[str] = None


class SettingsResponse(BaseModel):
    restaurant_name: Optional[str] = None
    restaurant_address: Optional[str] = None
    restaurant_lat: Optional[float] = None
    restaurant_lng: Optional[float] = None
    default_radius_miles: Optional[float] = None
    auto_send: Optional[bool] = None
    contact_name: Optional[str] = None