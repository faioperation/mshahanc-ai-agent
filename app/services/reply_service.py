from typing import Any, Dict
from openai import AsyncOpenAI

from app.config import settings
from app.airtable.reply_repo import create_reply
from app.airtable.lead_repo import get_lead_by_id, update_lead
from app.models.reply import Reply
from app.constants.lead_status import LeadStatus
from app.services.sequence_service import cancel_sequence
from app.utils.date_utils import now_utc


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def analyze_sentiment(reply_message: str) -> Dict[str, Any]:
    prompt = f"""
Analyze the sentiment of this reply message from a business:

"{reply_message}"

Respond with JSON only:
{{
    "sentiment": "positive" | "neutral" | "negative",
    "is_positive": true | false,
    "requires_human_review": true | false
}}
"""
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    import json
    content = response.choices[0].message.content.strip()
    content = content.replace("```json", "").replace("```", "").strip()
    return json.loads(content)


async def handle_reply(
    lead_id: str,
    channel: str,
    reply_message: str,
) -> Dict[str, Any]:

    lead = get_lead_by_id(lead_id)
    if not lead:
        raise Exception(f"Lead not found: {lead_id}")

    sentiment_data = await analyze_sentiment(reply_message)

    reply = Reply(
        lead_id=lead_id,
        lead_name=lead.get("business_name", ""),
        channel=channel,
        reply_message=reply_message,
        sentiment=sentiment_data.get("sentiment", "neutral"),
        is_positive=sentiment_data.get("is_positive", False),
        requires_human_review=sentiment_data.get("requires_human_review", True),
    )

    saved_reply = create_reply(reply.to_airtable_dict())

    update_lead(lead_id, {"status": LeadStatus.REPLIED})

    await cancel_sequence(lead_id)

    return saved_reply