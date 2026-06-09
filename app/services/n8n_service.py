import httpx
from app.config import settings


def convert_to_html(text: str) -> str:
    lines = text.split("\n")
    html_lines = []
    for line in lines:
        if line.strip() == "":
            html_lines.append("<br>")
        else:
            html_lines.append(f"<p style='margin:0 0 8px 0;'>{line}</p>")
    return "".join(html_lines)


async def send_email_via_n8n(
    to_email: str,
    subject: str,
    body: str,
    lead_id: str,
    event_id: str,
) -> bool:
    actual_email = settings.TEST_EMAIL if settings.TEST_MODE else to_email
    html_body = convert_to_html(body)

    payload = {
        "to_email": actual_email,
        "subject": subject,
        "body": html_body,
        "lead_id": lead_id,
        "event_id": event_id,
        "test_mode": settings.TEST_MODE,
        "original_email": to_email,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.N8N_EMAIL_WEBHOOK_URL,
            json=payload,
        )

    if response.status_code >= 400:
        raise Exception(f"n8n email webhook error {response.status_code}: {response.text}")

    return True


async def send_sms_via_n8n(
    to_phone: str,
    body: str,
    lead_id: str,
    event_id: str,
) -> bool:
    actual_phone = settings.TEST_PHONE if settings.TEST_MODE else to_phone

    payload = {
        "to_phone": actual_phone,
        "body": body,
        "lead_id": lead_id,
        "event_id": event_id,
        "test_mode": settings.TEST_MODE,
        "original_phone": to_phone,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.N8N_SMS_WEBHOOK_URL,
            json=payload,
        )

    if response.status_code >= 400:
        raise Exception(f"n8n SMS webhook error {response.status_code}: {response.text}")

    return True