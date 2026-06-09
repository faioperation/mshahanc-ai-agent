# FILE: app/services/message_service.py  (REPLACE existing)
from typing import Any, Dict, Optional
from datetime import datetime, timezone
from openai import AsyncOpenAI

from app.config import settings
from app.airtable.message_repo import create_message, update_message
from app.airtable.lead_repo import get_lead_by_id
from app.airtable.settings_repo import get_setting
from app.models.message import Message
from app.constants.message_status import MessageStatus
from app.utils.date_utils import now_utc


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def _build_event_block(event_context: Optional[Dict[str, Any]]) -> str:
    """Optional event details injected into the prompt. Empty when no campaign."""
    if not event_context or not event_context.get("event_name"):
        return ""

    name = event_context.get("event_name", "")
    city = event_context.get("event_city", "")
    date = event_context.get("event_date", "")
    description = event_context.get("event_description", "")
    is_big = event_context.get("is_big_event", False)

    big_line = (
        "\nThis is a MAJOR, high-profile event — convey appropriate scale, "
        "demand, and a sense of timely opportunity (without exaggerating)."
        if is_big else ""
    )

    return f"""

IMPORTANT — This outreach is tied to a specific upcoming event:
- Event: {name}
- City: {city}
- Date: {date or "see description"}
- Details: {description or "N/A"}{big_line}

Make the message clearly relevant to this event. Connect the catering offer to
the event naturally (e.g. catering for attendees, staff, or related gatherings
around "{name}" in {city}). Do NOT invent facts about the event beyond what is
given above. Keep it genuine and specific, not generic.
"""


async def generate_message_for_lead(
    lead_id: str,
    sequence_day: int,
    auto_send: bool = False,
    event_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:

    lead = get_lead_by_id(lead_id)
    if not lead:
        raise Exception(f"Lead not found: {lead_id}")

    restaurant_name = get_setting("restaurant_name") or "our restaurant"
    contact_name = get_setting("contact_name") or "Our Team"

    event_block = _build_event_block(event_context)

    prompt = f"""
You are writing a professional outreach email on behalf of {restaurant_name}, a catering service based in Los Angeles.

Target Business:
- Name: {lead.get('business_name')}
- Category: {lead.get('category', 'Business')}
- Address: {lead.get('address', '')}

Sequence Day: {sequence_day}
{"This is the initial outreach." if sequence_day == 0 else f"This is follow-up #{sequence_day}."}
{event_block}
Write a professional outreach email and SMS. Follow these rules strictly:

EMAIL:
- Subject line should be catchy and professional
- Email body must have proper paragraph breaks (use blank lines between paragraphs)
- Start with "Dear {lead.get('business_name')} Team,"
- Paragraph 1: Introduce {restaurant_name} and why you are reaching out
- Paragraph 2: What catering services are offered (corporate events, team lunches, meetings)
- Paragraph 3: Call to action — ask for a meeting or reply
- The sender's name is {contact_name}. Use this name, never use [Your Name] placeholder.
- Sign off with:
  Best regards,
  {contact_name}
  {restaurant_name} Catering Team
  Available for inquiries

SMS:
- Under 160 characters
- Friendly and direct
- Mention {restaurant_name} and catering

Format your response exactly like this:
EMAIL_SUBJECT: <subject here>
EMAIL_BODY: <full email body here with proper line breaks>
SMS_BODY: <sms body here>

Do not use any placeholder text like [Your Name] or [Contact Info].
Use {contact_name} and {restaurant_name} directly.
Write ready-to-send messages only.
"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    print(f"[OpenAI Raw Response]\n{content}")
    email_subject, email_body, sms_body = parse_openai_response(content)

    status = MessageStatus.APPROVED if auto_send else MessageStatus.PENDING_REVIEW

    message = Message(
        lead_id=lead_id,
        lead_name=lead.get("business_name", ""),
        sequence_day=sequence_day,
        status=status,
        email_subject=email_subject,
        email_body=email_body,
        sms_body=sms_body,
        approved_at=now_utc() if auto_send else None,
    )

    saved = create_message(message.to_airtable_dict())
    return saved


def parse_openai_response(content: str) -> tuple:
    email_subject = ""
    email_body = ""
    sms_body = ""

    try:
        lines = content.strip().split("\n")

        current_key = None
        buffer = []

        for line in lines:
            if line.startswith("EMAIL_SUBJECT:"):
                if current_key == "EMAIL_BODY":
                    email_body = "\n".join(buffer).strip()
                elif current_key == "SMS_BODY":
                    sms_body = "\n".join(buffer).strip()
                current_key = "EMAIL_SUBJECT"
                buffer = [line.replace("EMAIL_SUBJECT:", "").strip()]

            elif line.startswith("EMAIL_BODY:"):
                if current_key == "EMAIL_SUBJECT":
                    email_subject = "\n".join(buffer).strip()
                elif current_key == "SMS_BODY":
                    sms_body = "\n".join(buffer).strip()
                current_key = "EMAIL_BODY"
                buffer = [line.replace("EMAIL_BODY:", "").strip()]

            elif line.startswith("SMS_BODY:"):
                if current_key == "EMAIL_SUBJECT":
                    email_subject = "\n".join(buffer).strip()
                elif current_key == "EMAIL_BODY":
                    email_body = "\n".join(buffer).strip()
                current_key = "SMS_BODY"
                buffer = [line.replace("SMS_BODY:", "").strip()]

            else:
                buffer.append(line)

        if current_key == "EMAIL_SUBJECT":
            email_subject = "\n".join(buffer).strip()
        elif current_key == "EMAIL_BODY":
            email_body = "\n".join(buffer).strip()
        elif current_key == "SMS_BODY":
            sms_body = "\n".join(buffer).strip()

    except Exception as e:
        print(f"[Parse Error] {e}")
        print(f"[Raw Content] {content}")

    return email_subject, email_body, sms_body


async def approve_message(message_id: str) -> Dict[str, Any]:
    updated = update_message(message_id, {
        "status": MessageStatus.APPROVED,
        "approved_at": now_utc(),
    })
    return updated


async def reject_message(message_id: str) -> Dict[str, Any]:
    updated = update_message(message_id, {
        "status": MessageStatus.REJECTED,
    })
    return updated


async def update_message_content(
    message_id: str,
    email_subject: str = None,
    email_body: str = None,
    sms_body: str = None,
) -> Dict[str, Any]:
    data = {}
    if email_subject is not None:
        data["email_subject"] = email_subject
    if email_body is not None:
        data["email_body"] = email_body
    if sms_body is not None:
        data["sms_body"] = sms_body
    updated = update_message(message_id, data)
    return updated