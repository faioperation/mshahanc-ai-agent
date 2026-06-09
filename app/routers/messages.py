from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas.message import (
    MessageResponse,
    MessageUpdateRequest,
    MessageListResponse,
    MessageApproveRequest,
    MessageRejectRequest,
)
from app.services.message_service import (
    generate_message_for_lead,
    approve_message,
    reject_message,
    update_message_content,
)
from app.airtable.message_repo import (
    get_pending_review_messages,
    get_message_by_id,
    get_messages_by_lead,
)

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.post("/generate/{lead_id}", response_model=MessageResponse)
async def generate_message(lead_id: str, sequence_day: int = 0):
    try:
        message = await generate_message_for_lead(
            lead_id=lead_id,
            sequence_day=sequence_day,
        )
        return MessageResponse(**message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/review-queue", response_model=MessageListResponse)
def get_review_queue():
    try:
        messages = get_pending_review_messages()
        return MessageListResponse(
            total=len(messages),
            messages=[MessageResponse(**m) for m in messages],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}", response_model=MessageListResponse)
def get_messages_for_lead(lead_id: str):
    try:
        messages = get_messages_by_lead(lead_id)
        return MessageListResponse(
            total=len(messages),
            messages=[MessageResponse(**m) for m in messages],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{message_id}", response_model=MessageResponse)
def get_message(message_id: str):
    message = get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return MessageResponse(**message)


@router.patch("/{message_id}", response_model=MessageResponse)
async def update_message_endpoint(message_id: str, request: MessageUpdateRequest):
    try:
        updated = await update_message_content(
            message_id=message_id,
            email_subject=request.email_subject,
            email_body=request.email_body,
            sms_body=request.sms_body,
        )
        return MessageResponse(**updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/approve", response_model=MessageResponse)
async def approve_message_endpoint(request: MessageApproveRequest):
    try:
        updated = await approve_message(request.message_id)
        return MessageResponse(**updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reject", response_model=MessageResponse)
async def reject_message_endpoint(request: MessageRejectRequest):
    try:
        updated = await reject_message(request.message_id)
        return MessageResponse(**updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))