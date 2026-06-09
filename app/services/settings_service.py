from app.airtable.settings_repo import get_all_settings, set_setting
from app.schemas.settings import SettingsUpdateRequest, SettingsResponse


def get_settings() -> SettingsResponse:
    all_settings = get_all_settings()
    return SettingsResponse(
        restaurant_name=all_settings.get("restaurant_name"),
        restaurant_address=all_settings.get("restaurant_address"),
        restaurant_lat=float(all_settings["restaurant_lat"]) if all_settings.get("restaurant_lat") else None,
        restaurant_lng=float(all_settings["restaurant_lng"]) if all_settings.get("restaurant_lng") else None,
        default_radius_miles=float(all_settings["default_radius_miles"]) if all_settings.get("default_radius_miles") else None,
        auto_send=all_settings.get("auto_send") == "true" if all_settings.get("auto_send") else None,
        contact_name=all_settings.get("contact_name"),
    )


def update_settings(request: SettingsUpdateRequest) -> SettingsResponse:
    if request.restaurant_name is not None:
        set_setting("restaurant_name", request.restaurant_name)
    if request.restaurant_address is not None:
        set_setting("restaurant_address", request.restaurant_address)
    if request.restaurant_lat is not None:
        set_setting("restaurant_lat", str(request.restaurant_lat))
    if request.restaurant_lng is not None:
        set_setting("restaurant_lng", str(request.restaurant_lng))
    if request.default_radius_miles is not None:
        set_setting("default_radius_miles", str(request.default_radius_miles))
    if request.auto_send is not None:
        set_setting("auto_send", "true" if request.auto_send else "false")
    if request.contact_name is not None:
        set_setting("contact_name", request.contact_name)

    return get_settings()