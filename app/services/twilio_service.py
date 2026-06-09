from typing import Any, Dict
from twilio.rest import Client
from app.config import settings


def get_twilio_client() -> Client:
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def send_sms(to_phone: str, body: str) -> Dict[str, Any]:
    client = get_twilio_client()
    message = client.messages.create(
        body=body,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=to_phone,
    )
    return {
        "sid": message.sid,
        "status": message.status,
        "to": message.to,
    }


def parse_twilio_webhook(form_data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "from_phone": form_data.get("From"),
        "to_phone": form_data.get("To"),
        "body": form_data.get("Body"),
        "message_sid": form_data.get("MessageSid"),
        "account_sid": form_data.get("AccountSid"),
    }