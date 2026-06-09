from typing import Any, Dict, List, Optional
import re

from app.utils.email_validator import is_valid_email, clean_email
from app.constants.target_categories import TARGET_CATEGORIES, EXCLUDED_CATEGORIES


EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')


def normalize_phone(value: Any) -> Optional[str]:
    if not value:
        return None
    phone = str(value).strip()
    if not phone:
        return None
    return phone


def extract_email_from_text(value: Any) -> Optional[str]:
    if not value:
        return None
    if isinstance(value, str):
        matches = EMAIL_REGEX.findall(value)
        for match in matches:
            if is_valid_email(match):
                return match.lower()
    return None


def extract_email_from_nested_data(item: Dict[str, Any]) -> Optional[str]:
    direct_fields = ["email", "emails", "contactEmail", "businessEmail"]

    for field in direct_fields:
        value = item.get(field)
        if isinstance(value, str):
            email = clean_email(value)
            if email:
                return email
        if isinstance(value, list):
            for entry in value:
                if isinstance(entry, str):
                    email = clean_email(entry)
                    if email:
                        return email
                if isinstance(entry, dict):
                    for key in ["email", "value", "address"]:
                        email = clean_email(entry.get(key))
                        if email:
                            return email

    nested_lists = [
        "contacts", "contactDetails", "people",
        "leads", "leadsEnrichment", "emailsFromWebsite",
    ]

    for list_name in nested_lists:
        nested = item.get(list_name)
        if isinstance(nested, list):
            for entry in nested:
                if isinstance(entry, dict):
                    for key in ["email", "workEmail", "personalEmail", "value"]:
                        email = clean_email(entry.get(key))
                        if email:
                            return email
                elif isinstance(entry, str):
                    email = clean_email(entry)
                    if email:
                        return email

    return None


def is_excluded_category(category: str) -> bool:
    if not category:
        return False
    category_lower = category.lower()
    for excluded in EXCLUDED_CATEGORIES:
        if excluded in category_lower:
            return True
    return False


def is_target_category(category: str) -> bool:
    if not category:
        return False
    category_lower = category.lower()
    for target in TARGET_CATEGORIES:
        if target in category_lower:
            return True
    return False


def normalize_lead(item: Dict[str, Any]) -> Dict[str, Any]:
    business_name = (
        item.get("title")
        or item.get("name")
        or item.get("businessName")
        or item.get("placeName")
    )

    phone = normalize_phone(
        item.get("phone")
        or item.get("phoneNumber")
        or item.get("contactPhone")
        or item.get("internationalPhoneNumber")
    )

    email = extract_email_from_nested_data(item)

    website = (
        item.get("website")
        or item.get("url")
        or item.get("websiteUrl")
        or item.get("site")
    )

    address = (
        item.get("address")
        or item.get("street")
        or item.get("fullAddress")
    )

    category = None
    if isinstance(item.get("categoryName"), str):
        category = item.get("categoryName")
    elif isinstance(item.get("categories"), list) and item.get("categories"):
        category = ", ".join([str(c) for c in item.get("categories")])

    google_maps_url = item.get("url") or item.get("placeUrl")

    lat = item.get("lat") or item.get("latitude")
    lng = item.get("lng") or item.get("longitude")

    if not lat and isinstance(item.get("location"), dict):
        lat = item.get("location", {}).get("lat")
    if not lng and isinstance(item.get("location"), dict):
        lng = item.get("location", {}).get("lng")

    return {
        "business_name": business_name,
        "phone": phone,
        "email": email,
        "website": website,
        "address": address,
        "category": category,
        "google_maps_url": google_maps_url,
        "source": "apify_google_places",
        "lat": lat,
        "lng": lng,
    }


def qualify_lead(lead: Dict[str, Any]) -> Dict[str, Any]:
    if not lead.get("business_name"):
        return {"qualified": False, "reason": "Missing business name"}

    if not lead.get("phone") and not lead.get("email"):
        return {"qualified": False, "reason": "Missing both phone and email"}

    if not lead.get("email"):
        return {"qualified": False, "reason": "Missing email"}

    if not lead.get("phone"):
        return {"qualified": False, "reason": "Missing phone"}

    category = lead.get("category", "")

    if is_excluded_category(category):
        return {"qualified": False, "reason": f"Excluded category: {category}"}

    return {"qualified": True, "reason": None}