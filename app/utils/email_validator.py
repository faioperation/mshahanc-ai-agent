import re
from typing import Optional

STRICT_EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
)

INVALID_PATTERNS = [
    "google.com/maps",
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "tiktok.com",
    "pinterest.com",
    "http",
    "https",
    "www.",
    "/search",
    "@40.",
    "@73.",
    "@34.",
    "@41.",
]


def is_valid_email(value: Optional[str]) -> bool:
    if not value:
        return False

    value = value.strip()

    for pattern in INVALID_PATTERNS:
        if pattern in value:
            return False

    if not STRICT_EMAIL_REGEX.match(value):
        return False

    local, domain = value.split("@", 1)

    if len(local) < 1 or len(local) > 64:
        return False

    if len(domain) < 4:
        return False

    if domain.startswith(".") or domain.endswith("."):
        return False

    return True


def clean_email(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    value = value.strip().lower()

    if is_valid_email(value):
        return value

    return None