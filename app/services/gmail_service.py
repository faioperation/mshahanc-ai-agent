import base64
import json
from typing import Any, Dict, Optional

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.config import settings


def get_gmail_service():
    creds = Credentials(
        token=None,
        refresh_token=settings.GMAIL_REFRESH_TOKEN,
        client_id=settings.GMAIL_CLIENT_ID,
        client_secret=settings.GMAIL_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
    )
    service = build("gmail", "v1", credentials=creds)
    return service


def decode_pubsub_message(data: str) -> Dict[str, Any]:
    decoded = base64.b64decode(data).decode("utf-8")
    return json.loads(decoded)


def extract_reply_from_message(message_data: Dict[str, Any]) -> Optional[str]:
    payload = message_data.get("payload", {})
    parts = payload.get("parts", [])

    if parts:
        for part in parts:
            if part.get("mimeType") == "text/plain":
                body_data = part.get("body", {}).get("data", "")
                if body_data:
                    return base64.urlsafe_b64decode(body_data).decode("utf-8")
    else:
        body_data = payload.get("body", {}).get("data", "")
        if body_data:
            return base64.urlsafe_b64decode(body_data).decode("utf-8")

    return None


def get_message_by_id(message_id: str) -> Optional[Dict[str, Any]]:
    service = get_gmail_service()
    message = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()
    return message


def extract_lead_id_from_headers(message_data: Dict[str, Any]) -> Optional[str]:
    headers = message_data.get("payload", {}).get("headers", [])
    for header in headers:
        if header.get("name", "").lower() == "x-lead-id":
            return header.get("value")
    return None