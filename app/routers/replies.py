from fastapi import APIRouter, HTTPException, Request
from typing import Any, Dict

from app.schemas.reply import ReplyWebhookRequest, ReplyResponse, ReplyListResponse
from app.services.reply_service import handle_reply
from app.services.gmail_service import (
    decode_pubsub_message,
    get_message_by_id,
    extract_reply_from_message,
    extract_lead_id_from_headers,
)
from app.airtable.reply_repo import get_replies_by_lead
from app.airtable.lead_repo import get_all_leads, find_duplicate_lead

router = APIRouter(prefix="/api/replies", tags=["Replies"])


@router.post("/twilio-webhook")
async def twilio_webhook(request: Request):
    try:
        form_data = await request.form()
        data = dict(form_data)

        from_phone = data.get("From")
        body = data.get("Body")

        if not from_phone or not body:
            raise HTTPException(status_code=400, detail="Missing From or Body")

        # Match lead by phone number
        all_leads = get_all_leads()
        matched_lead = None
        for lead in all_leads:
            if lead.get("phone") and from_phone in lead.get("phone"):
                matched_lead = lead
                break

        if not matched_lead:
            return {"message": "No matching lead found for this phone number"}

        reply = await handle_reply(
            lead_id=matched_lead["id"],
            channel="sms",
            reply_message=body,
        )

        return {"message": "Reply processed", "reply_id": reply["id"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gmail-webhook")
async def gmail_webhook(request: Request):
    try:
        body = await request.json()

        # ── New flow: n8n sends from_email + reply_message directly ──
        from_email = body.get("from_email")
        reply_message = body.get("reply_message")

        if from_email and reply_message:
            # Clean up from_email — sometimes it's "Name <email@domain.com>"
            if "<" in from_email and ">" in from_email:
                from_email = from_email.split("<")[1].split(">")[0].strip()

            # Find lead by email
            matched_lead = find_duplicate_lead(email=from_email)

            if not matched_lead:
                # fallback: search all leads
                all_leads = get_all_leads()
                for lead in all_leads:
                    if lead.get("email") and lead["email"].lower() == from_email.lower():
                        matched_lead = lead
                        break

            if not matched_lead:
                return {"message": f"No matching lead found for email: {from_email}"}

            reply = await handle_reply(
                lead_id=matched_lead["id"],
                channel="email",
                reply_message=reply_message,
            )

            return {"message": "Reply processed", "reply_id": reply["id"]}

        # ── Legacy flow: Google Pub/Sub webhook ──
        message_data = body.get("message", {})
        data = message_data.get("data", "")

        if not data:
            return {"message": "No data in webhook"}

        pubsub_data = decode_pubsub_message(data)
        message_id = pubsub_data.get("historyId")

        if not message_id:
            return {"message": "No message ID found"}

        gmail_message = get_message_by_id(str(message_id))
        lead_id = extract_lead_id_from_headers(gmail_message)
        reply_text = extract_reply_from_message(gmail_message)

        if not lead_id or not reply_text:
            return {"message": "Could not extract lead ID or reply text"}

        reply = await handle_reply(
            lead_id=lead_id,
            channel="email",
            reply_message=reply_text,
        )

        return {"message": "Reply processed", "reply_id": reply["id"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}", response_model=ReplyListResponse)
def get_replies_for_lead(lead_id: str):
    try:
        replies = get_replies_by_lead(lead_id)
        return ReplyListResponse(
            total=len(replies),
            replies=[ReplyResponse(**r) for r in replies],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))